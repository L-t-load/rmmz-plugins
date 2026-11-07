/*:
 * @target MZ
 * @plugindesc v1.2 標準能力値に上下限とリミットブレイクを導入。装備とスキルのメモタグでBreak対象指定・パッシブ加算に対応。
 * @author 沖田小次郎
 *
 * @help OKT_ParamLimiter.js
 *
 * 標準パラメータ(0〜7)の最終値に対して、通常枠[min,max] または
 * リミットブレイク枠[breakMin,breakMax]でクリップします。
 *
 * ■ 追加対応（v1.1）
 * ・スキルのメモ欄に <LimitBreak> / <LimitBreak[2]> / <LimitBreak[0,2,4]> を書くと、
 *   「習得している間」そのParamをBreak対象にできます（装備タグと合算判定）。
 * ・スキルのメモ欄に <Param[2]:+500> のように書くと、
 *   「習得している間」そのParamの最終値に加算されます（複数スキルは合算、負数可）。
 *
 * ■ v1.2の変更
 * ・AddParamとの競合を避けるため、文章表示用の制御文字を削除しました。
 * ・標準能力値を文章に表示する場合は、イベントの「変数の操作」で
 *   「ゲームデータ」からアクターの能力値を取得し、\v[n] で表示してください。
 *
 * ■ 既存仕様（抜粋）
 * ・装備や職業、ステート、他プラグインによる補正を含む「最終結果」に対して作用。
 * ・min / max / breakMin / breakMax には数値 / 変数参照(V[n]/VarN) / ParamX が指定可能。
 * ・最大HPは安全策：min/breakMin<1 は 1、max/breakMax<1 は Infinity として扱う。
 *
 * ■ タグ例
 *  装備/スキル: <LimitBreak> / <LimitBreak[2]> / <LimitBreak[0,2,4]>
 *  スキルのみ  : <Param[2]:+500>  # 攻撃+500（習得中のみ有効）
 *
 * ■ 対象
 *  標準パラメータ（0:最大HP 1:最大MP 2:攻撃 3:防御 4:魔攻 5:魔防 6:敏捷 7:運）
 *
 * @param 標準パラメータ設定
 * @type struct<BaseParamGroup>
 * @text 標準パラメータ設定
 */

/*~struct~BaseParamGroup:
 * @param hp
 * @text 最大HP設定
 * @type struct<BaseParamSetting>
 * @default {"min":"1","max":"9999","breakMin":"1","breakMax":"99999"}
 *
 * @param mp
 * @text 最大MP設定
 * @type struct<BaseParamSetting>
 * @default {"min":"0","max":"9999","breakMin":"0","breakMax":"99999"}
 *
 * @param atk
 * @text 攻撃力設定
 * @type struct<BaseParamSetting>
 * @default {"min":"0","max":"999","breakMin":"0","breakMax":"9999"}
 *
 * @param def
 * @text 防御力設定
 * @type struct<BaseParamSetting>
 * @default {"min":"0","max":"999","breakMin":"0","breakMax":"9999"}
 *
 * @param mat
 * @text 魔法力設定
 * @type struct<BaseParamSetting>
 * @default {"min":"0","max":"999","breakMin":"0","breakMax":"9999"}
 *
 * @param mdf
 * @text 魔法防御設定
 * @type struct<BaseParamSetting>
 * @default {"min":"0","max":"999","breakMin":"0","breakMax":"9999"}
 *
 * @param agi
 * @text 敏捷性設定
 * @type struct<BaseParamSetting>
 * @default {"min":"0","max":"999","breakMin":"0","breakMax":"9999"}
 *
 * @param luk
 * @text 運設定
 * @type struct<BaseParamSetting>
 * @default {"min":"0","max":"999","breakMin":"0","breakMax":"9999"}
 */

/*~struct~BaseParamSetting:
 * @param min
 * @text 下限値
 * @type string
 * @default 0
 *
 * @param max
 * @text 上限値
 * @type string
 * @default 9999
 *
 * @param breakMin
 * @text Break下限値
 * @type string
 * @default 0
 *
 * @param breakMax
 * @text Break上限値
 * @type string
 * @default 9999
 */

(() => {
  "use strict";

  const pluginName = "OKT_ParamLimiter";
  const params = PluginManager.parameters(pluginName);

  // 原実装 param の退避（ParamX評価時の再帰回避に使用）
  const _Game_BattlerBase_param = Game_BattlerBase.prototype.param;

  // struct<BaseParamSetting> を安全にパース
  const parseSetting = (raw, defMin, defMax, defBreakMin, defBreakMax) => {
    let obj = null;
    if (typeof raw === "string" && raw !== "") {
      try { obj = JSON.parse(raw); } catch (_e) { obj = null; }
    } else if (raw && typeof raw === "object") {
      obj = raw;
    }
    const min = obj && obj.min != null ? String(obj.min) : String(defMin);
    const max = obj && obj.max != null ? String(obj.max) : String(defMax);
    const breakMin = obj && obj.breakMin != null ? String(obj.breakMin) : String(defBreakMin);
    const breakMax = obj && obj.breakMax != null ? String(obj.breakMax) : String(defBreakMax);
    return { min, max, breakMin, breakMax };
  };

  // 標準パラメータ設定（BaseParamGroup）をパース
  const groupRaw = params["標準パラメータ設定"];
  let group = {};
  if (typeof groupRaw === "string" && groupRaw !== "") {
    try { group = JSON.parse(groupRaw); } catch (_e) { group = {}; }
  }

  // paramId -> 設定
  // 0:MHP, 1:MMP, 2:ATK, 3:DEF, 4:MAT, 5:MDF, 6:AGI, 7:LUK
  const LIMIT_CONFIG = {
    0: parseSetting(group.hp, 1, 9999, 1, 99999),
    1: parseSetting(group.mp, 0, 9999, 0, 99999),
    2: parseSetting(group.atk, 0, 999, 0, 9999),
    3: parseSetting(group.def, 0, 999, 0, 9999),
    4: parseSetting(group.mat, 0, 999, 0, 9999),
    5: parseSetting(group.mdf, 0, 999, 0, 9999),
    6: parseSetting(group.agi, 0, 999, 0, 9999),
    7: parseSetting(group.luk, 0, 999, 0, 9999)
  };

  // ------------------------------------------------------------
  // ユーティリティ
  // ------------------------------------------------------------

  // 装備/スキルのメモ欄から LimitBreak を読み取り、指定paramIdが対象か判定
  function notesHasLimitBreakTarget(obj, paramId) {
    if (!obj || typeof obj.note !== "string") return false;
    const note = obj.note;
    const re = /<LimitBreak(?:\[(.*?)\])?>/gi;
    let m;
    while ((m = re.exec(note))) {
      const inner = m[1]; // [] の中身（無ければ undefined）
      if (!inner || !inner.trim()) return true; // 全パラメータ対象
      const ids = inner.split(",").map(s => Number(s.trim())).filter(Number.isFinite);
      if (ids.includes(paramId)) return true;
    }
    return false;
  }

  // バトラーの装備 or 習得スキルのどちらかにLimitBreakがあれば true
  function hasLimitBreakFlag(battler, paramId) {
    // 装備
    if (battler && battler.equips) {
      for (const eq of battler.equips()) {
        if (notesHasLimitBreakTarget(eq, paramId)) return true;
      }
    }
    // スキル（習得中）
    if (battler && battler.isActor && battler.isActor()) {
      const skills = battler.skills ? battler.skills() : [];
      for (const sk of skills) {
        if (notesHasLimitBreakTarget(sk, paramId)) return true;
      }
    }
    return false;
  }

  // スキルの <Param[ID]:+N> を合算（習得中のみ）
  function passiveAddFromSkills(battler, paramId) {
    if (!(battler && battler.isActor && battler.isActor())) return 0;
    const skills = battler.skills ? battler.skills() : [];
    if (!skills.length) return 0;

    let sum = 0;
    const re = /<Param\[(\d+)\]\s*:\s*([+\-]?\d+)\s*>/ig;
    for (const sk of skills) {
      if (!sk || typeof sk.note !== "string") continue;
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(sk.note)) !== null) {
        const pid = Number(m[1]);
        const val = Number(m[2]);
        if (pid === paramId && Number.isFinite(val)) sum += val;
      }
    }
    return sum;
  }

  // 下限・上限式を評価
  const evalLimitExpr = (expr, battler, fallback, selfParamId) => {
    if (expr == null) return fallback;
    const s = String(expr).trim();
    if (!s) return fallback;

    // 純粋な整数
    if (/^[-+]?\d+$/.test(s)) {
      const n = Number(s);
      return Number.isFinite(n) ? n : fallback;
    }

    // 変数参照 V[n] / VarN
    let m = s.match(/^V\[(\d+)\]$/i) || s.match(/^Var(\d+)$/i);
    if (m) {
      const vid = Number(m[1]);
      if ($gameVariables && Number.isFinite(vid)) {
        const v = Number($gameVariables.value(vid));
        return Number.isFinite(v) ? v : fallback;
      }
      return fallback;
    }

    // ParamX（0〜7 → 元param、8〜 → customParamがあれば）
    m = s.match(/^Param(\d+)$/i);
    if (m) {
      const pid = Number(m[1]);
      if (!Number.isFinite(pid) || !battler) return fallback;
      if (selfParamId != null && pid === selfParamId) return fallback; // 自己参照回避
      if (pid <= 7) {
        const v = Number(_Game_BattlerBase_param.call(battler, pid));
        return Number.isFinite(v) ? v : fallback;
      } else if (typeof battler.customParam === "function") {
        const v = Number(battler.customParam(pid));
        return Number.isFinite(v) ? v : fallback;
      }
      return fallback;
    }

    return fallback;
  };

  // paramId に対応する通常/Breakの境界を両方計算
  const calcBothBounds = (battler, paramId) => {
    const conf = LIMIT_CONFIG[paramId];
    if (!conf) return { nMin: -Infinity, nMax: Infinity, bMin: -Infinity, bMax: Infinity };

    let min      = evalLimitExpr(conf.min, battler, -Infinity, paramId);
    let max      = evalLimitExpr(conf.max, battler,  Infinity, paramId);
    let breakMin = evalLimitExpr(conf.breakMin, battler, min,      paramId);
    let breakMax = evalLimitExpr(conf.breakMax, battler, max,      paramId);

    // 最大HPは安全補正
    if (paramId === 0) {
      if (!Number.isFinite(min)      || min < 1)      min = 1;
      if (!Number.isFinite(breakMin) || breakMin < 1) breakMin = 1;
      if (!Number.isFinite(max)      || max < 1)      max = Infinity;
      if (!Number.isFinite(breakMax) || breakMax < 1) breakMax = Infinity;
    } else {
      if (!Number.isFinite(max))      max = Infinity;
      if (!Number.isFinite(breakMax)) breakMax = Infinity;
    }

    // 有限値に限り、下>上なら入替
    const fix = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && a > b) ? [b, a] : [a, b];
    [min, max]           = fix(min, max);
    [breakMin, breakMax] = fix(breakMin, breakMax);

    return { nMin: min, nMax: max, bMin: breakMin, bMax: breakMax };
  };

  // 元の param() をラップ：パッシブ加算 → クリップ
  Game_BattlerBase.prototype.param = function(paramId) {
    let value = _Game_BattlerBase_param.call(this, paramId);

    // スキルのパッシブ加算（習得中）
    if (paramId >= 0 && paramId <= 7) {
      value += passiveAddFromSkills(this, paramId);
    }

    // クリップ
    if (paramId >= 0 && paramId <= 7) {
      const bounds = calcBothBounds(this, paramId);
      const useBreak = hasLimitBreakFlag(this, paramId);
      const lo = useBreak ? bounds.bMin : bounds.nMin;
      const hi = useBreak ? bounds.bMax : bounds.nMax;

      if (Number.isFinite(hi)) value = Math.min(value, hi);
      if (Number.isFinite(lo)) value = Math.max(value, lo);
    }

    return value;
  };

})();
