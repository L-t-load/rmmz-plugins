/*:
 * @target MZ
 * @plugindesc ショップの買価・売価をメモ欄や条件で細かく調整します v1.0.0
 * @author 沖田小次郎
 * @license MIT
 * 
 * @help
 * ■ 概要
 *  ショップでの買価・売価を拡張するプラグインです。
 *  アイテム/武器/防具のメモ欄にタグを書くことで、
 *  価格倍率、固定価格、売却不可、スイッチ条件つき価格などを設定できます。
 *
 * ■ アイテム/武器/防具 メモ欄
 *  買価:
 *   <Buy[2]:120%>
 *   <Buy[3]:*1.2>
 *   <Buy[4]:500>
 *   <Buy[5]:v[1]*10>
 *
 *  売価:
 *   <Sell[7]:120%>
 *   <Sell[8]:*1.5>
 *   <Sell[9]:250>
 *   <Sell[10]:v[2]+100>
 *
 *  [] 内はスイッチIDです。
 *  指定スイッチがONの時だけ適用されます。
 *  複数ON時、倍率は乗算され、固定価格は最後に書いたものが優先されます。
 *
 * ■ 売価の基本設定
 *   <sell:60%>
 *   <sell:*0.6>
 *   <sell:300>
 *   <sell:price*0.6+v[21]>
 *
 *  売却不可:
 *   <nosell>
 *   <sell:none>
 *
 *  式の中の price は「条件Buy適用後の買価」を指します。
 *
 * ■ 適用順
 *  買価：DB → アイテム条件Buy → Math.floor
 *  売価：<sell:…>/既定％（基準=アイテム条件Buy後の買価）
 *      → アイテム条件Sell（倍率合成/絶対上書き）
 *      → 丸め/単位/上下限
 *
 * ■ 式の中で使えるもの
 *  price : 条件Buy適用後の買価
 *  id    : アイテム/武器/防具ID
 *  type  : 'item' / 'weapon' / 'armor'
 *  v[ID] : 変数
 *  Math  : Math関数
 *
 * ■ ライセンス
 *  MIT License
 *
 * @param defaultSellRate
 * @text 既定売価レート（%）
 * @type number @min 0 @max 100
 * @default 50
 *
 * @param categoryRateItem
 * @text アイテム既定％
 * @type number @min 0 @max 100
 * @default 0
 *
 * @param categoryRateWeapon
 * @text 武器既定％
 * @type number @min 0 @max 100
 * @default 0
 *
 * @param categoryRateArmor
 * @text 防具既定％
 * @type number @min 0 @max 100
 * @default 0
 *
 * @param roundingMode
 * @text 丸め
 * @type select
 * @option 切り捨て @value floor
 * @option 四捨五入 @value round
 * @option 切り上げ @value ceil
 * @default floor
 *
 * @param roundingUnit
 * @text 丸め単位
 * @type number @min 1
 * @default 1
 *
 * @param minPrice
 * @text 最小売価
 * @type number @min 0
 * @default 0
 *
 * @param maxPrice
 * @text 最大売価
 * @type number @min 0
 * @desc 0は無制限
 * @default 0
 *
 * @param allowZero
 * @text 0円を許可
 * @type boolean @on 許可 @off 不許可(1Gに補正)
 * @default false
 *
 * @param nosellBehavior
 * @text <nosell>の扱い
 * @type select
 * @option 非表示 @value hide
 * @option 0円で無効表示 @value disable
 * @default disable
 *
 * @param enableEval
 * @text 式評価を有効化
 * @type boolean @on 有効 @off 無効
 * @default true
 *
 * @param globalFormula
 * @text グローバル既定式（<sell>無し時）
 * @type text
 * @desc price は「アイテム条件Buy後の買価」。利用: price,id,type,v[ID],Math
 * @default 
 */


(() => {
  "use strict";

  const PN = "OKT_ShopPricePlus";
  const P = PluginManager.parameters(PN);

  const cfg = {
    defaultRate: Number(P.defaultSellRate || 50),
    catItem: Number(P.categoryRateItem || 0),
    catWeapon: Number(P.categoryRateWeapon || 0),
    catArmor: Number(P.categoryRateArmor || 0),
    rounding: String(P.roundingMode || "floor"),
    unit: Math.max(1, Number(P.roundingUnit || 1)),
    min: Math.max(0, Number(P.minPrice || 0)),
    max: Math.max(0, Number(P.maxPrice || 0)),
    allowZero: P.allowZero === "true",
    nosellBehavior: String(P.nosellBehavior || "disable"),
    enableEval: P.enableEval === "true",
    globalFormula: String(P.globalFormula || "").trim()
  };

  // ---------- utils ----------
  const isItem = DataManager.isItem;
  const isWeapon = DataManager.isWeapon;
  const isArmor = DataManager.isArmor;

  function objType(o) {
    if (isItem(o)) return "item";
    if (isWeapon(o)) return "weapon";
    if (isArmor(o)) return "armor";
    return "unknown";
  }
  function basePrice(i) { return Number(i?.price || 0); }

  function applyRound(v) {
    switch (cfg.rounding) {
      case "ceil": return Math.ceil(v);
      case "round": return Math.round(v);
      case "floor":
      default: return Math.floor(v);
    }
  }
  function roundByUnit(v) {
    const u = cfg.unit;
    if (u <= 1) return applyRound(v);
    return applyRound(v / u) * u;
  }
  function clampPrice(v) {
    let x = v;
    if (cfg.max > 0) x = Math.min(x, cfg.max);
    x = Math.max(x, cfg.min);
    if (!cfg.allowZero && x <= 0) x = 1;
    return Number(x) || 0;
  }
  function finalize(v) {
    return clampPrice(roundByUnit(v));       // ← applyRound はここから外す
  }

  function varProxy() {
    return new Proxy({}, {
      get(_t, prop) { return $gameVariables ? $gameVariables.value(Number(prop)) : 0; }
    });
  }
  function tryEval(expr, ctx) {
    if (!cfg.enableEval || !expr) return null;
    try {
      const fn = new Function("price", "id", "type", "v", "Math", `return (${expr});`);
      return fn(ctx.price, ctx.id, ctx.type, varProxy(), Math);
    } catch (e) {
      console.warn(`[${PN}] 式評価に失敗: ${expr}`, e);
      return null;
    }
  }

  function hasNoSell(it) {
    const m = it?.meta || {};
    if (m.nosell != null) return true;
    if (m.sell && String(m.sell).toLowerCase() === "none") return true;
    return false;
  }
  function rateByCategory(it) {
    const t = objType(it);
    if (t === "item" && cfg.catItem > 0) return cfg.catItem;
    if (t === "weapon" && cfg.catWeapon > 0) return cfg.catWeapon;
    if (t === "armor" && cfg.catArmor > 0) return cfg.catArmor;
    return cfg.defaultRate;
  }

  // ---------- 条件倍率/絶対（<Buy[ID]:...>/<Sell[ID]:...>） ----------
  function parsePercentOrStarToRate(text, ctx) {
    const s = String(text).trim();
    // (式)% 例：(v[1]+20)%
    let m = s.match(/^(.+?)\s*%$/i);
    if (m) { const v = tryEval(m[1], ctx); return v != null ? Number(v) / 100 : null; }
    // 120% / %120
    m = s.match(/^(\d+(?:\.\d+)?)\s*%$/i); if (m) return Number(m[1]) / 100;
    m = s.match(/^%\s*(\d+(?:\.\d+)?)$/i); if (m) return Number(m[1]) / 100;
    // *1.2
    m = s.match(/^\*\s*(\d+(?:\.\d+)?)$/i); if (m) return Number(m[1]);
    return null;
  }
  function parseConditionalSpec(text, ctx) {
    // ★追加：売却不可キーワード
    const t = String(text).trim().toLowerCase();
    if (t === "none" || t === "nosell") return { type: "nosell" };

    const rate = parsePercentOrStarToRate(text, ctx);
    if (rate != null) return { type: "mult", value: rate };
    if (/^\d+$/i.test(String(text).trim())) return { type: "abs", value: Number(text) };
    const v = tryEval(text, ctx);
    return (v != null) ? { type: "abs", value: Number(v) } : null;
  }

  function conditionalModFor(item, key, base) {
    const note = String(item?.note || "");
    const re = new RegExp(`<${key}\\[(\\d+)\\]\\s*:\\s*([^>]+)>`, "gi");
    let m, mul = 1, abs = null, nosell = false;
    const ctx = { price: Number(base), id: Number(item?.id || 0), type: objType(item) };
    while ((m = re.exec(note)) !== null) {
      const swId = Number(m[1]);
      if (!$gameSwitches || !$gameSwitches.value(swId)) continue;
      const spec = parseConditionalSpec(m[2], ctx);
      if (!spec) continue;
      if (spec.type === "mult") mul *= Number(spec.value);
      else if (spec.type === "abs") abs = Number(spec.value); // 後勝ち
      else if (spec.type === "nosell" && key === "Sell") nosell = true; // ★追加
    }
    return { mul, abs, nosell }; // ★戻り値に nosell を追加
  }


  // ---------- 買価 ----------
  const _WSB_price = Window_ShopBuy.prototype.price;
  Window_ShopBuy.prototype.price = function (item) {
    // DB基準のみ（ショップイベント倍率は廃止）
    let p = Math.floor(item.price ?? 0); // ← ここを直接DB価格に
    const mod = conditionalModFor(item, "Buy", p);
    p = (mod.abs != null) ? Math.floor(mod.abs) : Math.floor(p * mod.mul);
    return p;
  };

  // アイテム条件Buy適用後の買価（売価の基準）
  function itemLevelBuyPrice(item) {
    let p = Math.floor(basePrice(item));
    const mod = conditionalModFor(item, "Buy", p);
    p = (mod.abs != null) ? Math.floor(mod.abs) : Math.floor(p * mod.mul);
    return p;
  }

  // ---------- <sell:...> 解析（price = アイテム条件Buy後の買価） ----------
  function parseSellMeta(it) {
    const raw = String(it?.meta?.sell ?? "").trim();
    if (!raw) return null;
    let m = raw.match(/^(\d+(?:\.\d+)?)\s*%$/i);
    if (m) return { kind: "percent", value: Number(m[1]) };
    m = raw.match(/^%\s*(\d+(?:\.\d+)?)$/i);
    if (m) return { kind: "percent", value: Number(m[1]) };
    m = raw.match(/^\*\s*(\d+(?:\.\d+)?)$/i);
    if (m) return { kind: "mult", value: Number(m[1]) };
    if (/^\d+$/i.test(raw)) return { kind: "fixed", value: Number(raw) };
    return cfg.enableEval ? { kind: "expr", value: raw } : null;
  }
  function computeSellBase(it) {
    const itemBuy = itemLevelBuyPrice(it);  // ←基準（ショップ側は見ない）
    const id = Number(it?.id || 0);
    const type = objType(it);
    const spec = parseSellMeta(it);

    if (spec) {
      switch (spec.kind) {
        case "fixed": return spec.value;
        case "percent": return itemBuy * (spec.value / 100);
        case "mult": return itemBuy * spec.value;
        case "expr": {
          const v = tryEval(spec.value, { price: itemBuy, id, type });
          return v != null ? Number(v) : itemBuy * (rateByCategory(it) / 100);
        }
      }
    }
    if (cfg.enableEval && cfg.globalFormula) {
      const v = tryEval(cfg.globalFormula, { price: itemBuy, id, type });
      if (v != null) return Number(v);
    }
    return itemBuy * (rateByCategory(it) / 100);
  }

  // ---------- 売価 ----------
  const _WSS_price = Window_ShopSell.prototype.price;
  Window_ShopSell.prototype.price = function (item) {
    if (!item) return 0;
    if (hasNoSell(item)) return 0;

    // 基礎（<sell:...> or 既定％）※ここではまだ丸めない
    let p = computeSellBase(item);

    // アイテム個別 条件（Sell）
    const mod = conditionalModFor(item, "Sell", p);
    if (mod.nosell) return 0;
    p = (mod.abs != null) ? mod.abs : (p * mod.mul);

    // 最後に一度だけ 丸め/単位/上下限 を適用
    return finalize(p);
  };

  // 売却リストから <nosell> を非表示
  const _WSS_makeItemList = Window_ShopSell.prototype.makeItemList;
  Window_ShopSell.prototype.makeItemList = function () {
    _WSS_makeItemList.call(this);
    if (cfg.nosellBehavior === "hide") {
      this._data = this._data.filter(it => {
        if (!it) return false;
        // 無条件の <nosell> / <sell:none>
        if (hasNoSell(it)) return false;
        // ★追加：条件 <Sell[ID]:none>（ONの時だけ非表示）
        const mod = conditionalModFor(it, "Sell", 0);
        if (mod.nosell) return false;
        return true;
      });
    }
  };

  // ---- 最終強制フック（売価専用、買価には影響しない）----
  (() => {
    const _origSellingPrice = Scene_Shop.prototype.sellingPrice;
    Scene_Shop.prototype.sellingPrice = function () {
      const item = this._item;
      // 売るときにだけ適用
      if (this._commandWindow && this._commandWindow.currentSymbol() === 'sell') {
        if (this._sellWindow && item && this._sellWindow.price) {
          return this._sellWindow.price(item); // ← 売価を必ず通す
        }
      }
      // それ以外（買う時など）は元の処理に戻す
      return _origSellingPrice ? _origSellingPrice.call(this) : 0;
    };

    const _numSetup = Window_ShopNumber.prototype.setup;
    Window_ShopNumber.prototype.setup = function (item, max, price) {
      const scene = SceneManager._scene;
      // 売却タブの時だけ強制
      if (scene && scene._commandWindow && scene._commandWindow.currentSymbol() === 'sell') {
        const real = scene.sellingPrice();
        _numSetup.call(this, item, max, real);
      } else {
        _numSetup.call(this, item, max, price); // 買う時はそのまま
      }
    };
  })();

  // ---- nosell の強制無効化（0円でも売れないようにする）----
  (() => {
    "use strict";

    // 今この瞬間 nosell かを判定（無条件 <nosell> も条件付き <Sell[n]:none> も対象）
    function isNoSellNow(item) {
      if (!item) return false;
      // 無条件 <nosell> / <sell:none>
      const m = item.meta || {};
      if (Object.prototype.hasOwnProperty.call(m, "nosell")) return true;
      if (typeof m.sell === "string" && m.sell.trim().toLowerCase() === "none") return true;
      // 条件付き <Sell[n]:none>
      const mod = (function () {
        // conditionalModFor はプラグイン本体の関数を使う
        try { return conditionalModFor(item, "Sell", 0); } catch (_) { return { nosell: false }; }
      })();
      return !!mod.nosell;
    }

    // 1) 売るウィンドウの「選択可否」を nosell で必ず無効化
    const _isEnabled = Window_ShopSell.prototype.isEnabled;
    Window_ShopSell.prototype.isEnabled = function (item) {
      if (isNoSellNow(item)) return false; // ← ここで強制的に無効化
      // 既定の「価格>0」チェックも生かす
      return _isEnabled ? _isEnabled.call(this, item) : (item && this.price(item) > 0);
    };

    // 2) 念のため、実行時（売却確定）でもブロック
    const _doSell = Scene_Shop.prototype.doSell;
    Scene_Shop.prototype.doSell = function (number) {
      const it = this._item;
      if (isNoSellNow(it)) {
        SoundManager.playBuzzer();
        return; // 売却を行わない
      }
      _doSell.call(this, number);
    };
  })();

})();
