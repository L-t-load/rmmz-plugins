/*:
 * @target MZ
 * @plugindesc マップイベント拡張（名札表示 / 描画位置調整 / 親子追従 / ページ跨ぎ実行 / 1枚画像表示）
 * @author KOJIRO OKITA
 * @help
 * ■ 概要
 *  マップイベントを拡張する総合プラグインです。
 *  名札表示・描画位置調整・親子追従・ページ跨ぎラベル実行・一枚画像表示に対応します。
 *
 * --------------------------------------------------
 * ■ 名札表示機能
 *  イベントの頭上に名前や説明を表示します。
 *
 *  ▼ メモ欄
 *   <名前:武具屋トム>
 *   <名前2:裏稼業>
 *   <Door:城下町の通路>
 *
 *  ▼ 特徴
 *   ・プリセットで見た目を管理（文字色 / 背景 / 角丸 / 不透明度 など）
 *   ・マップ内で最前面（ピクチャより下）に表示
 *
 * --------------------------------------------------
 * ■ 名札の表示制御（プラグインコマンド）
 *  イベント中に名札を変更・非表示にできます。
 *
 *   ・名札を表示（上書き）
 *   ・名札を非表示（フレーム指定で自動復帰可能）
 *
 * --------------------------------------------------
 * ■ 名札テキストの特殊制御文字
 *  名札内で以下が使用可能です。
 *
 *   \v[n]        ：変数
 *   \EVNAME      ：このイベント名
 *   \EVNAME[n]   ：指定イベント名
 *   \MAPNAME     ：マップ名
 *   このイベントの名前
 *   このマップ名
 *
 * --------------------------------------------------
 * ■ 描画位置調整（locate）
 *  イベント画像の表示位置を見た目だけずらします。
 *
 *  ▼ メモ欄
 *   <locate:x +3,y -8>
 *   <locate:+3,-8>
 *
 *  ※座標は変わらず、見た目のみ移動します
 *
 * --------------------------------------------------
 * ■ 親子イベント機能
 *  イベントを別のイベントに追従させます。
 *
 *  ▼ メモ欄
 *   <Parent:12>
 *
 *  ▼ スイッチ条件付き
 *   <Parent[2]:12>
 *   → スイッチ2がONの時のみ追従
 *
 *  ▼ 特徴
 *   ・移動 / 斜め移動 / ジャンプ / 位置変更に対応
 *   ・移動速度 / 頻度も親に同期
 *
 * --------------------------------------------------
 * ■ ページ跨ぎラベル実行
 *  別ページのラベルを呼び出せます。
 *
 *   CrossPageJump（戻らない）
 *   CrossPageCall（戻る）
 *
 *  ▼ ラベル指定
 *   #2:テスト
 *   → 2ページ目の「テスト」ラベル
 *
 * --------------------------------------------------
 * ■ OneImage（1枚画像表示）
 *  キャラチップを分割せず、画像を1枚として表示します。
 *
 *  ▼ メモ欄
 *   <OneImage>
 *
 *  ▼ 用途
 *   ・家具
 *   ・看板
 *   ・大型オブジェクト
 *   ・専用イベント画像
 *
 *  ▼ 補足
 *   ・表示位置はイベントの足元基準
 *   ・当たり判定は通常通り（1マス）
 *   ・<locate> と併用可能
 *
 * --------------------------------------------------
 * ■ ライセンス
 *  MIT License
 *
 * @command CrossPageJump
 * @text ページ跨ぎジャンプ（戻らない）
 * @arg labelText
 * @text ラベル名
 * @type string
 * @default テスト
 * @arg eventId
 * @text 対象イベントID
 * @type number
 * @min -1
 * @default 0
 * @arg searchMode
 * @text 探索順
 * @type select
 * @option auto（後ろのページ優先）
 * @value auto
 * @option newestFirst（後ろ→前）
 * @value newestFirst
 * @option oldestFirst（前→後ろ）
 * @value oldestFirst
 * @default auto
 * @arg ifNotFound
 * @text 見つからない時
 * @type select
 * @option 何もしない（ignore）
 * @value ignore
 * @option 警告ログ（warn）
 * @value warn
 * @option エラーにする（error）
 * @value error
 * @default warn
 *
 * @command CrossPageCall
 * @text ページ跨ぎコール（戻る）
 * @arg labelText
 * @text ラベル名
 * @type string
 * @default テスト
 * @arg eventId
 * @text 対象イベントID
 * @type number
 * @min -1
 * @default 0
 * @arg searchMode
 * @text 探索順
 * @type select
 * @option auto（後ろのページ優先）
 * @value auto
 * @option newestFirst（後ろ→前）
 * @value newestFirst
 * @option oldestFirst（前→後ろ）
 * @value oldestFirst
 * @default auto
 * @arg ifNotFound
 * @text 見つからない時
 * @type select
 * @option 何もしない（ignore）
 * @value ignore
 * @option 警告ログ（warn）
 * @value warn
 * @option エラーにする（error）
 * @value error
 * @default warn
 *
 * @command NameTagShow
 * @text 名札を表示（上書き）
 * @desc 指定イベント（0=呼び元, -1=正面, >0=ID）の名札を即時表示。本文とプリセット（タグ名）を上書きし、メモ欄より優先します。
 * @arg eventId
 * @text 対象イベントID
 * @type number
 * @min -1
 * @default 0
 * @arg presetTag
 * @text プリセット（タグ名）
 * @type string
 * @desc 例：名前 / 名前2 / Door など。空欄なら既定プリセットを使用
 * @default
 * @arg displayText
 * @text 表示テキスト
 * @type string
 * @desc 表示させたい名前を入力
 * @default
 *
 * @command NameTagHide
 * @text 名札を非表示
 * @desc 指定イベントの名札を隠します（メモ欄より優先）。再表示は「名札を表示（上書き）」、またはフレーム経過後に自動再表示。
 * @arg eventId
 * @text 対象イベントID
 * @type number
 * @min -1
 * @default 0
 * @arg durationFrames
 * @text 非表示フレーム数
 * @type number
 * @min 0
 * @default 0
 * @desc 0（未入力）=ずっと非表示。1以上=そのフレーム経過後に自動で再表示（60で約1秒）
 *
 * @param ShowNameTag
 * @text 名札を表示
 * @type boolean
 * @on 表示する
 * @off 表示しない
 * @default true
 *
 * @param NameTagSwitchId
 * @text 表示制御スイッチID
 * @type switch
 * @desc 0=無視。指定スイッチがONのときだけ名札表示。
 * @default 0
 *
 * @param NameTagDefaultPreset
 * @text 既定プリセット名
 * @type string
 * @desc <名前:...> 等でプリセット未指定のときに使うプリセット名
 * @default 名前
 *
 * @param NameTagPresets
 * @text 名札プリセット一覧
 * @type struct<NameTagPreset>[]
 * @desc ここに複数プリセットを登録（例：「名前」「名前2」「Door」）
 * @default ["{\"Tag\":\"名前\",\"FontSize\":\"18\",\"TextColor\":\"#FFFFFF\",\"OutlineColor\":\"#000000\",\"OutlineWidth\":\"3\",\"TextOpacity\":\"255\",\"BgColor\":\"#000000\",\"BgOpacity\":\"153\",\"BgRadius\":\"6\",\"Padding\":\"8\",\"OffsetY\":\"-4\"}","{\"Tag\":\"名前2\",\"FontSize\":\"18\",\"TextColor\":\"#000000\",\"OutlineColor\":\"#FFFFFF\",\"OutlineWidth\":\"4\",\"TextOpacity\":\"255\",\"BgColor\":\"#000000\",\"BgOpacity\":\"180\",\"BgRadius\":\"6\",\"Padding\":\"8\",\"OffsetY\":\"-4\"}","{\"Tag\":\"Door\",\"FontSize\":\"18\",\"TextColor\":\"#FFFFFF\",\"OutlineColor\":\"#000000\",\"OutlineWidth\":\"2\",\"TextOpacity\":\"255\",\"BgColor\":\"#000000\",\"BgOpacity\":\"220\",\"BgRadius\":\"6\",\"Padding\":\"10\",\"OffsetY\":\"-4\"}"]
 */

/*~struct~NameTagPreset:
 * @param Tag
 * @text プリセット名（＝タグ名）
 * @desc 例：名前 / 名前2 / Door など。<Tag:テキスト> でこのプリセットを直接使えます。
 *
 * @param FontSize
 * @text フォントサイズ
 * @type number
 * @min 8
 * @max 64
 * @default 18
 *
 * @param TextColor
 * @text 文字色
 * @type string
 * @default #FFFFFF
 *
 * @param OutlineColor
 * @text ふち色
 * @type string
 * @default #000000
 *
 * @param OutlineWidth
 * @text ふち幅
 * @type number
 * @min 0
 * @max 8
 * @default 3
 *
 * @param TextOpacity
 * @text 文字不透明度
 * @type number
 * @min 0
 * @max 255
 * @default 255
 * 
 * @param OutlineOpacity
 * @text ふち不透明度
 * @type number
 * @min 0
 * @max 255
 * @default 255
 *
 * @param BgColor
 * @text 背景色
 * @type string
 * @default #000000
 *
 * @param BgOpacity
 * @text 背景不透明度
 * @type number
 * @min 0
 * @max 255
 * @default 153
 *
 * @param BgRadius
 * @text 角丸半径
 * @type number
 * @min 0
 * @max 32
 * @default 6
 *
 * @param Padding
 * @text 左右余白
 * @type number
 * @min 0
 * @max 64
 * @default 8
 *
 * @param OffsetY
 * @text 縦オフセット（頭上から）
 * @type number
 * @min -256
 * @max 256
 * @default -4
 */

(() => {
    "use strict";
    const PLUGIN_NAME = "OKT_MapEventPlus";

    // ---------- パラメータ ----------
    const PP = PluginManager.parameters(PLUGIN_NAME);
    const P_ShowNameTag = (PP["ShowNameTag"] ?? "true") === "true";
    const P_NameTagSwitchId = Number(PP["NameTagSwitchId"] || 0);
    const P_DefaultPresetName = String(PP["NameTagDefaultPreset"] || "名前");

    function parseStructArray(json, fallback = []) {
        try { return JSON.parse(json || "[]").map(s => JSON.parse(s)); }
        catch { return fallback; }
    }

    const PresetList = parseStructArray(PP["NameTagPresets"]);
    const PresetsByTag = {};
    for (const p of PresetList) {
        const key = String(p.Tag || "").trim();
        if (!key) continue;
        PresetsByTag[key] = {
            fontSize: Number(p.FontSize || 18),
            textColor: String(p.TextColor || "#FFFFFF"),
            outlineColor: String(p.OutlineColor || "#000000"),
            outlineWidth: (p.OutlineWidth !== undefined && p.OutlineWidth !== "") ? Number(p.OutlineWidth) : 3,
            outlineOpacity: (p.OutlineOpacity !== undefined && p.OutlineOpacity !== "")
                ? Math.max(0, Math.min(255, Number(p.OutlineOpacity)))
                : 255,
            textOpacity: Math.max(0, Math.min(255, Number(p.TextOpacity || 255))),
            bgColor: String(p.BgColor || "#000000"),
            bgOpacity: Math.max(0, Math.min(255, Number(p.BgOpacity || 153))),
            bgRadius: Math.max(0, Number(p.BgRadius || 6)),
            padding: Math.max(0, Number(p.Padding || 8)),
            offsetY: Number(p.OffsetY ?? -4)
        };
    }

    // ---------- 共通ユーティリティ ----------
    function parsePinned(labelText) {
        const s = String(labelText || "");
        const m = /^#(\d+):(.+)$/.exec(s);
        return m ? { pinned: Number(m[1]), name: String(m[2]).trim() }
            : { pinned: null, name: s.trim() };
    }

    function findLabelIndex(list, name) {
        if (!Array.isArray(list)) return -1;
        for (let i = 0; i < list.length; i++) {
            const cmd = list[i];
            if (cmd && cmd.code === 118 && String(cmd.parameters?.[0]) === name) return i;
        }
        return -1;
    }

    function resolveEventId(interpreter, hint) {
        if (hint > 0) return hint;
        if (hint === -1) {
            const x = $gamePlayer.frontX?.() ?? $gamePlayer.x;
            const y = $gamePlayer.frontY?.() ?? $gamePlayer.y;
            const eid = $gameMap.eventIdXy?.(x, y) ?? 0;
            return eid || 0;
        }
        if (interpreter && interpreter._eventId > 0) return interpreter._eventId;
        const root = $gameMap?._interpreter;
        if (root && root._eventId > 0) return root._eventId;
        return 0;
    }

    function searchLabelOnEvent(eid, curList, name, pinned, mode) {
        const ev = $dataMap?.events?.[eid];
        if (!ev || !Array.isArray(ev.pages)) return null;

        if (pinned != null) {
            const page = ev.pages[pinned - 1];
            const idx = findLabelIndex(page?.list, name);
            if (idx >= 0) return { list: page.list, index: idx };
        }

        const idxs = [...ev.pages.keys()];
        const order = (mode === "oldestFirst") ? idxs : idxs.reverse();
        for (const p of order) {
            const page = ev.pages[p];
            if (!page?.list) continue;
            if (page.list === curList) continue;
            const idx = findLabelIndex(page.list, name);
            if (idx >= 0) return { list: page.list, index: idx };
        }
        return null;
    }

    function applyJump(self, list, index, eventId) {
        const eid = eventId ?? self._eventId ?? 0;
        // ★ インタプリタを“そのページのリストで再初期化”してからラベルへジャンプ
        self.setup(list, eid);   // _index は -1 に、各種状態もクリーンに
        self.jumpTo(index);      // ラベル位置へ
    }

    function applyCall(self, list, index, eventId) {
        const slice = list.slice(index);
        self.setupChild(slice, eventId);
    }

    // \v[n] + イベント依存トークン
    function resolveTextForEvent(text, ev) {
        let out = String(text ?? "");
        out = out.replace(/\\[Vv]\[(\d+)\]/g, (_, n) => {
            const v = $gameVariables.value(Number(n) || 0);
            return (v == null) ? "" : String(v);
        });
        const evId = (ev && ev.eventId) ? ev.eventId() : (ev?._eventId || 0);
        const evName = $dataMap?.events?.[evId]?.name || "";
        const mapName = $dataMap?.displayName || "";
        out = out.replace(/\\EVNAME\[(\d+)\]/ig, (_, n) => ($dataMap?.events?.[Number(n)]?.name || ""));
        out = out.replace(/\\(EVNAME|EN|ENAME)/ig, evName);
        out = out.replace(/\\MAPNAME/ig, mapName);
        out = out.replace(/このイベントの名前/g, evName);
        out = out.replace(/このマップ名/g, mapName);
        return out.trim();
    }

    // ---------- 既存コマンド ----------
    function runCross(interpreter, args, isCall) {
        if (!interpreter || !Array.isArray(interpreter._list)) return;

        const rawLabel = resolveTextForEvent(args.labelText, $gameMap.event(resolveEventId(interpreter, Number(args.eventId || 0))));
        const eventIdArg = Number(args.eventId || 0);
        const searchMode = String(args.searchMode || "auto");
        const ifNotFound = String(args.ifNotFound || "warn");

        const { pinned, name } = parsePinned(rawLabel);
        const eid = resolveEventId(interpreter, eventIdArg);

        let idx = findLabelIndex(interpreter._list, name);
        if (idx >= 0) {
            isCall ? applyCall(interpreter, interpreter._list, idx, eid)
                : applyJump(interpreter, interpreter._list, idx, eid);
            return;
        }
        const found = searchLabelOnEvent(eid, interpreter._list, name, pinned, searchMode);
        if (found) {
            isCall ? applyCall(interpreter, found.list, found.index, eid)
                : applyJump(interpreter, found.list, found.index, eid);
            return;
        }
        const msg = `[OKT_CrossPageRunner] ラベルが見つかりません: eid=${eid}, label="${args.labelText}"`;
        if (ifNotFound === "error") throw new Error(msg);
        if (ifNotFound === "warn") console.warn(msg);
    }

    PluginManager.registerCommand(PLUGIN_NAME, "CrossPageJump", function (args) {
        try { runCross(this, args, false); } catch (e) { console.error(e); }
    });

    PluginManager.registerCommand(PLUGIN_NAME, "CrossPageCall", function (args) {
        try { runCross(this, args, true); } catch (e) { console.error(e); }
    });

    // ---------- 名札：メモ解析 ----------
    function extractTagValue(note, tagName) {
        if (!note) return "";
        const esc = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const reHalf = new RegExp(`<\\s*${esc}\\s*:\\s*([^>]+?)\\s*>`, "i");
        const reFull = new RegExp(`＜\\s*${esc}\\s*:\\s*([^＞]+?)\\s*＞`, "i");
        const m1 = reHalf.exec(note); if (m1) return String(m1[1]).trim();
        const m2 = reFull.exec(note); if (m2) return String(m2[1]).trim();
        return "";
    }

    function pickNameTagSpec(evData) {
        const note = String(evData?.note || "");
        if (!note) return { rawText: "", preset: null };

        // プリセット名＝タグ名で直指定を優先
        for (const tag in PresetsByTag) {
            const txt = extractTagValue(note, tag);
            if (txt) return { rawText: txt, preset: tag };
        }

        // NamePreset / 名前プリセット
        const presetKey = extractTagValue(note, "NamePreset") || extractTagValue(note, "名前プリセット");

        // 共通タグ 群
        let rawText =
            extractTagValue(note, "名前") ||
            extractTagValue(note, "Name") ||
            "";

        // 既定プリセット名のタグ <既定:...> でも拾う
        if (!rawText && P_DefaultPresetName) {
            const t = extractTagValue(note, P_DefaultPresetName);
            if (t) return { rawText: t, preset: PresetsByTag[P_DefaultPresetName] ? P_DefaultPresetName : (presetKey || null) };
        }

        return { rawText, preset: presetKey || (PresetsByTag[P_DefaultPresetName] ? P_DefaultPresetName : null) };
    }

    // ＜locate:x +3,y -8＞ / <locate:+3,-8> を解析して {x,y} を返す
    function extractLocateOffset(note) {
        const text = String(note || "");
        const mHalf = /<\s*locate\s*:\s*([^>]+)\s*>/i.exec(text);
        const mFull = /＜\s*locate\s*:\s*([^＞]+)\s*＞/i.exec(text);
        let body = (mHalf ? mHalf[1] : (mFull ? mFull[1] : "")).trim();
        if (!body) return { x: 0, y: 0 };

        body = body
            .replace(/＋/g, "+").replace(/－/g, "-")
            .replace(/，/g, ",").replace(/：/g, ":");

        // \v[n] 展開（必要なら）
        body = body.replace(/\\[Vv]\[(\d+)\]/g, (_, n) => {
            const v = $gameVariables.value(Number(n) || 0);
            return (v == null) ? "" : String(v);
        });

        const rx = /x\s*:?\s*([+-]?\d+)/i.exec(body);
        const ry = /y\s*:?\s*([+-]?\d+)/i.exec(body);
        if (rx || ry) return { x: rx ? Number(rx[1]) : 0, y: ry ? Number(ry[1]) : 0 };

        const pair = /([+-]?\d+)\s*[,、]\s*([+-]?\d+)/.exec(body);
        return pair ? { x: Number(pair[1]), y: Number(pair[2]) } : { x: 0, y: 0 };
    }

    // ＜Parent:12＞ / <Parent:12> / ＜Parent[2]:12＞ / <Parent[2]:12> を解析
    function extractParentSpec(note) {
        const text = String(note || "");
        // 半角
        const mHalf = /<\s*parent\s*(?:\[\s*(\d+)\s*\])?\s*:\s*(\d+)\s*>/i.exec(text);
        // 全角
        const mFull = /＜\s*parent\s*(?:［\s*(\d+)\s*］)?\s*：\s*(\d+)\s*＞/i.exec(text);
        const m = mHalf || mFull;
        if (!m) return { id: 0, switchId: 0 };
        const switchId = Number(m[1] || 0);
        const id = Number(m[2] || 0);
        return { id, switchId };
    }

    // ---------- Game_Event 拡張（上書き/非表示フラグ） ----------
    // _oktNameTagOverrideText: 文字列をセットするとメモ欄より優先
    // _oktNameTagOverrideTag : プリセット名（タグ名）を上書き
    // _oktNameTagManualHidden : true の間は強制非表示
    Game_Event.prototype.oktNameTagRaw = function () {
        if (!P_ShowNameTag) return "";
        if (P_NameTagSwitchId > 0 && !$gameSwitches.value(P_NameTagSwitchId)) return "";
        if (this._oktNameTagManualHidden) return "";
        if (this._oktNameTagOverrideText != null && this._oktNameTagOverrideText !== undefined) {
            return String(this._oktNameTagOverrideText);
        }
        const spec = pickNameTagSpec(this.event?.());
        return spec.rawText || "";
    };

    Game_Event.prototype.oktNameTagPresetKey = function () {
        if (!P_ShowNameTag) return null;
        if (P_NameTagSwitchId > 0 && !$gameSwitches.value(P_NameTagSwitchId)) return null;
        if (this._oktNameTagManualHidden) return null;
        if (this._oktNameTagOverrideTag) return String(this._oktNameTagOverrideTag);
        const spec = pickNameTagSpec(this.event?.());
        return spec.preset || null;
    };

    Game_Event.prototype.oktLocateOffset = function () {
        if (!this._oktLocateCache) {
            const evData = this.event?.();
            this._oktLocateCache = extractLocateOffset(evData?.note || "");
        }
        return this._oktLocateCache;
    };

    const _Game_Event_setupPage = Game_Event.prototype.setupPage;
    Game_Event.prototype.setupPage = function () {
        _Game_Event_setupPage.call(this);
        this._oktLocateCache = null; // ページ切替で再読込
    };

    const _Game_Event_update = Game_Event.prototype.update;
    Game_Event.prototype.update = function () {
        _Game_Event_update.call(this);

        // 名札の一時非表示タイマー（フレーム）
        if (this._oktNameTagHideTimer != null && this._oktNameTagHideTimer > 0) {
            this._oktNameTagHideTimer--;
            if (this._oktNameTagHideTimer <= 0) {
                this._oktNameTagHideTimer = null;
                this._oktNameTagManualHidden = false; // 自動で再表示
            }
        }
    };

    // 親ID/スイッチIDのアクセサ
    Game_Event.prototype.oktParentId = function () {
        return this._oktParentId || 0;
    };
    Game_Event.prototype.oktParentSwitchId = function () {
        return this._oktParentSwitchId || 0;
    };

    // setupPage を1本に統合：locate再読込＋Parent[sw]解析の両方
    const _OKT_GE_setupPage_all = Game_Event.prototype.setupPage;
    Game_Event.prototype.setupPage = function () {
        _OKT_GE_setupPage_all.call(this);

        // ＜locate:...＞のキャッシュはページ切替で無効化
        this._oktLocateCache = null;

        // ＜Parent:12＞ / ＜Parent[2]:12＞ を読み込む
        const evData = this.event?.();
        const spec = extractParentSpec(evData?.note || ""); // 先に定義してある関数を使用
        this._oktParentId = (spec.id > 0 && spec.id !== this.eventId()) ? spec.id : 0;
        this._oktParentSwitchId = spec.switchId > 0 ? spec.switchId : 0;
    };

    // ---------- プラグインコマンド：名札 表示/非表示 ----------
    PluginManager.registerCommand(PLUGIN_NAME, "NameTagShow", function (args) {
        const eid = resolveEventId(this, Number(args.eventId || 0));
        const ev = $gameMap.event(eid);
        if (!ev) return;

        // 空欄は「上書きしない（=メモ欄に従う）」にする
        const tag =
            args.presetTag != null && String(args.presetTag).trim() !== ""
                ? String(args.presetTag).trim()
                : null;
        const txt =
            args.displayText != null && String(args.displayText).trim() !== ""
                ? String(args.displayText).trim()
                : null;

        ev._oktNameTagManualHidden = false;   // 非表示フラグ解除
        ev._oktNameTagHideTimer = null;
        ev._oktNameTagOverrideTag = tag;     // null ならメモ欄のプリセット/既定に委ねる
        ev._oktNameTagOverrideText = txt;     // null ならメモ欄の本文に委ねる

        // （任意）即時反映したい場合は次の2行を有効に
        // const spr = SceneManager._scene?._spriteset?._characterSprites?.find(s => s._character === ev);
        // if (spr?.redrawOktNameTagIfNeeded) spr.redrawOktNameTagIfNeeded(true);
    });

    PluginManager.registerCommand(PLUGIN_NAME, "NameTagHide", function (args) {
        const eid = resolveEventId(this, Number(args.eventId || 0));
        const ev = $gameMap.event(eid);
        if (!ev) return;

        const frames = Number(args.durationFrames || 0);

        ev._oktNameTagManualHidden = true;              // 今すぐ非表示
        ev._oktNameTagHideTimer = frames > 0 ? frames : null; // 0/未入力なら無期限
    });

    // ---------- Spriteset_Map：名札レイヤー（tilemap配下=ピクチャより下） ----------
    const _Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
    Spriteset_Map.prototype.createUpperLayer = function () {
        _Spriteset_Map_createUpperLayer.call(this);
        this._oktNameTagLayer = new Sprite();
        this._tilemap.addChild(this._oktNameTagLayer);
    };

    const _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function () {
        _Spriteset_Map_update.call(this);
        if (this._oktNameTagLayer && this._oktNameTagLayer.parent === this._tilemap) {
            const top = this._tilemap.children.length - 1;
            if (this._tilemap.getChildIndex(this._oktNameTagLayer) !== top) {
                this._tilemap.setChildIndex(this._oktNameTagLayer, top);
            }
        }
    };

    // ---------- 角丸矩形 ----------
    function drawRoundedRect(bitmap, x, y, w, h, r, color, alpha01) {
        const ctx = bitmap._context;
        const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
        ctx.fillStyle = color;
        const old = ctx.globalAlpha;
        ctx.globalAlpha = alpha01;
        ctx.fill();
        ctx.globalAlpha = old;
        ctx.restore();
        bitmap._baseTexture.update();
    }

    // ---------- Sprite_Character ----------
    const _Sprite_Character_setCharacter = Sprite_Character.prototype.setCharacter;
    Sprite_Character.prototype.setCharacter = function (character) {
        _Sprite_Character_setCharacter.call(this, character);
        this._oktNameTagSprite = null;
        this._oktNameTagTextCached = undefined;
        this._oktNameTagStyleKeyCached = undefined;
        this._oktNameTagBitmapW = 0;
        this._oktNameTagBitmapH = 0;
        if (character instanceof Game_Event) this.createOktNameTagSprite();
    };

    // 名札はまずキャラ子に付け、Spriteset準備後に名札レイヤーへ移設（安全）
    Sprite_Character.prototype.createOktNameTagSprite = function () {
        if (this._oktNameTagSprite) return;
        const s = new Sprite();
        s.anchor.x = 0.5;
        s.anchor.y = 1.0;
        s.bitmap = new Bitmap(4, 4);
        this._oktNameTagSprite = s;
        this.addChild(s); // 暫定
        this.redrawOktNameTagIfNeeded(true);
    };

    Sprite_Character.prototype._moveNameTagToLayerIfReady = function () {
        const spr = this._oktNameTagSprite;
        if (!spr) return;
        const spriteset = SceneManager._scene?._spriteset;
        if (spriteset && spriteset._oktNameTagLayer && spr.parent !== spriteset._oktNameTagLayer) {
            if (spr.parent) spr.parent.removeChild(spr);
            spriteset._oktNameTagLayer.addChild(spr);
        }
    };

    function resolveStyleForEvent(ev) {
        const key = ev.oktNameTagPresetKey();
        if (key && PresetsByTag[key]) return { key, ...PresetsByTag[key] };
        return {
            key: "(default)",
            fontSize: 18,
            textColor: "#FFFFFF",
            outlineColor: "#000000",
            outlineWidth: 3,
            outlineOpacity: 255,
            textOpacity: 255,
            bgColor: "#000000",
            bgOpacity: 153,
            bgRadius: 6,
            padding: 8,
            offsetY: -4
        };
    }

    Sprite_Character.prototype.redrawOktNameTagIfNeeded = function (force = false) {
        if (!this._oktNameTagSprite) return;
        const ev = this._character;
        if (!(ev instanceof Game_Event)) return;

        const raw = ev.oktNameTagRaw();
        const text = resolveTextForEvent(raw, ev);
        const style = resolveStyleForEvent(ev);

        const changed = text !== this._oktNameTagTextCached || style.key !== this._oktNameTagStyleKeyCached;
        if (!force && !changed) return;
        this._oktNameTagTextCached = text;
        this._oktNameTagStyleKeyCached = style.key;

        const spr = this._oktNameTagSprite;
        if (!text) { spr.visible = false; return; }

        // サイズ
        const measure = new Bitmap(1, 1);
        measure.fontSize = style.fontSize;
        measure.outlineWidth = style.outlineWidth;
        const textWidth = Math.ceil(measure.measureTextWidth(text));
        const bw = Math.max(4, textWidth + style.padding * 2);
        const bh = Math.ceil(style.fontSize + 8);

        // 描画
        spr.bitmap = new Bitmap(bw, bh);
        spr.bitmap.fontSize = style.fontSize;
        spr.bitmap.outlineWidth = style.outlineWidth;
        spr.bitmap.textColor = style.textColor;
        spr.bitmap.outlineColor = style.outlineColor;

        // ---- 背景（角丸）はそのまま ----
        if (style.bgOpacity > 0) {
            drawRoundedRect(spr.bitmap, 0, 0, bw, bh, style.bgRadius, style.bgColor, style.bgOpacity / 255);
        }

        // ---- 文字とふちを別アルファで描画（2パス）----
        const ctx = spr.bitmap._context;
        const oldAlpha = ctx.globalAlpha;

        // 1) アウトラインのみ描画
        if (style.outlineWidth > 0 && style.outlineOpacity > 0) {
            const keepTextColor = spr.bitmap.textColor;
            const keepOutlineW = spr.bitmap.outlineWidth;

            spr.bitmap.outlineWidth = style.outlineWidth;
            spr.bitmap.textColor = "rgba(0,0,0,0)"; // 塗りを透明にして枠だけ出す
            // 枠色は spr.bitmap.outlineColor = style.outlineColor のままでOK
            ctx.globalAlpha = style.outlineOpacity / 255;
            spr.bitmap.drawText(text, 0, 0, bw, bh, "center");

            // 戻す
            spr.bitmap.textColor = keepTextColor;
            spr.bitmap.outlineWidth = keepOutlineW;
        }

        // 2) 本文のみ描画
        ctx.globalAlpha = style.textOpacity / 255;
        const keepOutlineW2 = spr.bitmap.outlineWidth;
        spr.bitmap.outlineWidth = 0; // 塗りのみ
        spr.bitmap.drawText(text, 0, 0, bw, bh, "center");
        spr.bitmap.outlineWidth = keepOutlineW2;

        // 後処理
        ctx.globalAlpha = oldAlpha;
        spr.bitmap._baseTexture.update();
        spr.visible = true;

    };

    const _Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function () {
        _Sprite_Character_updatePosition.call(this);
        const ch = this._character;
        if (ch instanceof Game_Event) {
            const off = ch.oktLocateOffset();
            if (off && (off.x || off.y)) {
                this.x += off.x;
                this.y += off.y;
            }
        }
    };

    const _Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function () {
        _Sprite_Character_update.call(this);

        const spr = this._oktNameTagSprite;
        if (!spr) return;

        const ev = this._character;
        if (!(ev instanceof Game_Event)) return;

        const hasText = !!ev.oktNameTagRaw();
        spr.visible = hasText && !ev.isTransparent();
        if (!spr.visible) return;

        // レイヤー移設
        this._moveNameTagToLayerIfReady();

        const style = resolveStyleForEvent(ev);
        const headOffset = -this.patternHeight();

        if (spr.parent === this) {
            spr.x = 0;
            spr.y = headOffset + style.offsetY;  // 暫定（キャラ子）
        } else {
            spr.x = this.x;
            spr.y = this.y + headOffset + style.offsetY; // 名札レイヤー（tilemap配下）
        }

        this.redrawOktNameTagIfNeeded(false);
    };

    function childrenOf(eId) {
        if (!eId) return [];
        const evs = $gameMap.events();
        if (!Array.isArray(evs)) return [];
        return evs.filter(e =>
            e &&
            typeof e.oktParentId === "function" &&
            e.oktParentId() === eId &&
            childFollowEnabled(e)       // ← スイッチONの子だけ追従対象
        );
    }

    // 親イベントを取得
    function parentEventOf(ev) {
        if (!(ev instanceof Game_Event)) return null;
        const pid = ev.oktParentId ? ev.oktParentId() : 0;
        return pid > 0 ? $gameMap.event(pid) : null;
    }

    // スイッチ条件：<Parent[sw]:..> の sw が ON のときだけ追従を有効にする
    function childFollowEnabled(ev) {
        if (!(ev instanceof Game_Event)) return false;
        const sid = ev.oktParentSwitchId ? ev.oktParentSwitchId() : 0;
        return sid === 0 ? true : $gameSwitches.value(sid);
    }

    // 親と同じ移動速度/頻度に“常時”同期（追従有効時のみ）
    const _OKT_GE_update_speedSync = Game_Event.prototype.update;
    Game_Event.prototype.update = function () {
        _OKT_GE_update_speedSync.call(this);

        const p = parentEventOf(this);
        if (p && childFollowEnabled(this)) {
            if (this.moveSpeed() !== p.moveSpeed()) this.setMoveSpeed(p.moveSpeed());
            if (this.moveFrequency() !== p.moveFrequency()) this.setMoveFrequency(p.moveFrequency());
        }
    };

    // 4) 親が動いたら子も同じだけ動かす（直子のみ／再帰防止）
    const _OKT_GC_moveStraight_parent = Game_Character.prototype.moveStraight;
    Game_Character.prototype.moveStraight = function (d) {
        const wasX = this.x, wasY = this.y;
        _OKT_GC_moveStraight_parent.call(this, d);
        if (this instanceof Game_Event && !this._oktMovingAsChild && (this.x !== wasX || this.y !== wasY)) {
            for (const k of childrenOf(this.eventId())) {
                if (k.moveSpeed() !== this.moveSpeed()) k.setMoveSpeed(this.moveSpeed());
                if (k.moveFrequency() !== this.moveFrequency()) k.setMoveFrequency(this.moveFrequency());
                if (!k || k._oktMovingAsChild) continue;
                k._oktMovingAsChild = true;
                try { k.moveStraight(d); } finally { k._oktMovingAsChild = false; }
            }
        }
    };

    const _OKT_GC_moveDiagonally_parent = Game_Character.prototype.moveDiagonally;
    Game_Character.prototype.moveDiagonally = function (horz, vert) {
        const wasX = this.x, wasY = this.y;
        _OKT_GC_moveDiagonally_parent.call(this, horz, vert);
        if (this instanceof Game_Event && !this._oktMovingAsChild && (this.x !== wasX || this.y !== wasY)) {
            for (const k of childrenOf(this.eventId())) {
                if (k.moveSpeed() !== this.moveSpeed()) k.setMoveSpeed(this.moveSpeed());
                if (k.moveFrequency() !== this.moveFrequency()) k.setMoveFrequency(this.moveFrequency());
                if (!k || k._oktMovingAsChild) continue;
                if (k.moveSpeed() !== this.moveSpeed()) k.setMoveSpeed(this.moveSpeed());
                if (k.moveFrequency() !== this.moveFrequency()) k.setMoveFrequency(this.moveFrequency());
                k._oktMovingAsChild = true;
                try { k.moveDiagonally(horz, vert); } finally { k._oktMovingAsChild = false; }
            }
        }
    };

    const _OKT_GC_jump_parent = Game_Character.prototype.jump;
    Game_Character.prototype.jump = function (dx, dy) {
        const wasX = this.x, wasY = this.y;
        _OKT_GC_jump_parent.call(this, dx, dy);
        if (this instanceof Game_Event && !this._oktMovingAsChild && (this.x !== wasX || this.y !== wasY)) {
            for (const k of childrenOf(this.eventId())) {
                if (k.moveSpeed() !== this.moveSpeed()) k.setMoveSpeed(this.moveSpeed());
                if (k.moveFrequency() !== this.moveFrequency()) k.setMoveFrequency(this.moveFrequency());
                if (!k || k._oktMovingAsChild) continue;
                k._oktMovingAsChild = true;
                try { k.jump(dx, dy); } finally { k._oktMovingAsChild = false; }
            }
        }
    };

    const _OKT_GCB_locate_parent = Game_CharacterBase.prototype.locate;
    Game_CharacterBase.prototype.locate = function (x, y) {
        if (this instanceof Game_Event && !this._oktMovingAsChild) {
            const oldX = this.x, oldY = this.y;
            _OKT_GCB_locate_parent.call(this, x, y);
            const dx = this.x - oldX, dy = this.y - oldY;
            if (dx || dy) {
                for (const k of childrenOf(this.eventId())) {
                    if (k.moveSpeed() !== this.moveSpeed()) k.setMoveSpeed(this.moveSpeed());
                    if (k.moveFrequency() !== this.moveFrequency()) k.setMoveFrequency(this.moveFrequency());
                    if (!k || k._oktMovingAsChild) continue;
                    const nx = k.x + dx, ny = k.y + dy;
                    if ($gameMap.isValid(nx, ny)) {
                        k._oktMovingAsChild = true;
                        try { _OKT_GCB_locate_parent.call(k, nx, ny); } finally { k._oktMovingAsChild = false; }
                    }
                }
            }
            return;
        }
        _OKT_GCB_locate_parent.call(this, x, y);
    };

    // ---------- OneImage：イベントキャラ画像を1枚絵として扱う ----------
    function oktHasOneImageTag(note) {
        const text = String(note || "");
        return /<\s*OneImage\s*>/i.test(text) || /＜\s*OneImage\s*＞/i.test(text);
    }

    Game_Event.prototype.oktIsOneImage = function () {
        const evData = this.event?.();
        return oktHasOneImageTag(evData?.note || "");
    };

    const _OKT_SC_patternWidth_oneImage = Sprite_Character.prototype.patternWidth;
    Sprite_Character.prototype.patternWidth = function () {
        const ch = this._character;
        if (ch instanceof Game_Event && ch.oktIsOneImage && ch.oktIsOneImage()) {
            return this.bitmap ? this.bitmap.width : 0;
        }
        return _OKT_SC_patternWidth_oneImage.call(this);
    };

    const _OKT_SC_patternHeight_oneImage = Sprite_Character.prototype.patternHeight;
    Sprite_Character.prototype.patternHeight = function () {
        const ch = this._character;
        if (ch instanceof Game_Event && ch.oktIsOneImage && ch.oktIsOneImage()) {
            return this.bitmap ? this.bitmap.height : 0;
        }
        return _OKT_SC_patternHeight_oneImage.call(this);
    };

    const _OKT_SC_characterBlockX_oneImage = Sprite_Character.prototype.characterBlockX;
    Sprite_Character.prototype.characterBlockX = function () {
        const ch = this._character;
        if (ch instanceof Game_Event && ch.oktIsOneImage && ch.oktIsOneImage()) {
            return 0;
        }
        return _OKT_SC_characterBlockX_oneImage.call(this);
    };

    const _OKT_SC_characterBlockY_oneImage = Sprite_Character.prototype.characterBlockY;
    Sprite_Character.prototype.characterBlockY = function () {
        const ch = this._character;
        if (ch instanceof Game_Event && ch.oktIsOneImage && ch.oktIsOneImage()) {
            return 0;
        }
        return _OKT_SC_characterBlockY_oneImage.call(this);
    };

    const _OKT_SC_characterPatternX_oneImage = Sprite_Character.prototype.characterPatternX;
    Sprite_Character.prototype.characterPatternX = function () {
        const ch = this._character;
        if (ch instanceof Game_Event && ch.oktIsOneImage && ch.oktIsOneImage()) {
            return 0;
        }
        return _OKT_SC_characterPatternX_oneImage.call(this);
    };

    const _OKT_SC_characterPatternY_oneImage = Sprite_Character.prototype.characterPatternY;
    Sprite_Character.prototype.characterPatternY = function () {
        const ch = this._character;
        if (ch instanceof Game_Event && ch.oktIsOneImage && ch.oktIsOneImage()) {
            return 0;
        }
        return _OKT_SC_characterPatternY_oneImage.call(this);
    };

})();
