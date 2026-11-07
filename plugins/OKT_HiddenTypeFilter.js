/*:
 * @target MZ
 * @plugindesc 指定したタイプを各種一覧から非表示にします v1.1.0
 * @author 沖田小次郎
 *
 * @param HideTag
 * @text 非表示タグ
 * @type string
 * @default <HideType>
 * @desc タイプ名に含めると非表示にするタグ文字列
 *
 * @param HiddenSkillTypes
 * @text 非表示スキルタイプID
 * @type number[]
 * @default []
 * @desc 非表示にするスキルタイプのIDリスト（JSON形式）
 *
 * @param HiddenWeaponTypes
 * @text 非表示武器タイプID
 * @type number[]
 * @default []
 * @desc 非表示にする武器タイプのIDリスト（JSON形式）
 *
 * @param HiddenArmorTypes
 * @text 非表示防具タイプID
 * @type number[]
 * @default []
 * @desc 非表示にする防具タイプIDリスト（JSON形式）
 *
 * @param DisableSwitchId
 * @text 無効化スイッチID
 * @type switch
 * @default 0
 * @desc 指定したスイッチがONのときプラグイン機能を無効化します（0で常時有効）
 *
 * @help
 * 【概要】
 * このプラグインは、プラグインパラメーターで設定した
 * スキルタイプ、武器タイプ、防具タイプを各種UIから非表示にします。
 * このプラグインで設定した武器や防具のタイプを隠しアイテムとして使用することができます。
 *
 * 【使い方】
 * 1. プラグインマネージャーで以下を設定してください。
 *    - 非表示タグ: タイプ名に含めると自動的に非表示になる文字列
 *    - 非表示スキルタイプID: メニューから非表示にするスキルタイプIDの配列
 *    - 非表示武器タイプID: メニューから非表示にする武器タイプIDの配列
 *    - 非表示防具タイプID: メニューから非表示にする防具タイプIDの配列
 *    - 無効化スイッチID: ONのときプラグインの動作を停止（0で常時有効）
 *
 * 【アイテム一覧】
 * 武器・防具はアイテム一覧でも非表示になります。
 * $dataSystem.itemTypes がある環境では、タグ付きアイテムタイプも対象です。
 * 標準のRPGツクールMZにはアイテムタイプ名の設定欄はありません。
 *
 * 【注意】
 * - 初期装備またはイベントコマンドで装備変更した装備は装備中リストに表示されます。
 * - タグによる非表示とIDリストによる非表示の両方で判定します。
 *
 * 【利用規約】
 * MIT License。商用・非商用を問わず利用・改変・再配布できます。
 * 再配布時は著作権表示とライセンス全文を保持してください。
 * 詳細は同梱の LICENSE.txt をご確認ください。
 */

(() => {
    const pluginName = document.currentScript.src.split('/').pop().replace(/\.js$/, '');
    const params = PluginManager.parameters(pluginName);
    const HideTag = String(params['HideTag'] || '<HideType>');
    const DisableSwitchId = Number(params['DisableSwitchId'] || 0);

    // JSON形式の配列パラメーターを解析
    const HiddenSkillTypes = JSON.parse(params['HiddenSkillTypes'] || '[]').map(id => Number(id) || 0);
    const HiddenWeaponTypes = JSON.parse(params['HiddenWeaponTypes'] || '[]').map(id => Number(id) || 0);
    const HiddenArmorTypes = JSON.parse(params['HiddenArmorTypes'] || '[]').map(id => Number(id) || 0);

    function pluginEnabled() {
        return DisableSwitchId === 0 || !$gameSwitches.value(DisableSwitchId);
    }

    function hasHideTag(name) {
        return name && name.includes(HideTag);
    }

    function isHiddenSkillType(id) {
        if (!pluginEnabled() || id <= 0) return false;
        const name = $dataSystem.skillTypes[id];
        return (name && hasHideTag(name)) || HiddenSkillTypes.includes(id);
    }

    function isHiddenWeaponType(id) {
        if (!pluginEnabled() || id <= 0) return false;
        const name = $dataSystem.weaponTypes[id];
        return (name && hasHideTag(name)) || HiddenWeaponTypes.includes(id);
    }

    function isHiddenArmorType(id) {
        if (!pluginEnabled() || id <= 0) return false;
        const name = $dataSystem.armorTypes[id];
        return (name && hasHideTag(name)) || HiddenArmorTypes.includes(id);
    }

    function isHiddenItemType(id) {
        if (!pluginEnabled() || id <= 0) return false;
        return !!($dataSystem.itemTypes && hasHideTag($dataSystem.itemTypes[id]));
    }

    // --- ウィンドウ拡張 ---
    // スキルタイプ一覧
    const _Window_SkillType_makeCommandList = Window_SkillType.prototype.makeCommandList;
    Window_SkillType.prototype.makeCommandList = function () {
        _Window_SkillType_makeCommandList.call(this);
        this._list = this._list.filter(cmd => !isHiddenSkillType(cmd.ext));
    };

    // スキルリスト
    const _Window_SkillList_includes = Window_SkillList.prototype.includes;
    Window_SkillList.prototype.includes = function (item) {
        if (item && isHiddenSkillType(item.stypeId)) return false;
        return _Window_SkillList_includes.call(this, item);
    };

    // 装備リスト
    const _Window_EquipItem_includes = Window_EquipItem.prototype.includes;
    Window_EquipItem.prototype.includes = function (item) {
        if (item) {
            if (DataManager.isWeapon(item) && isHiddenWeaponType(item.wtypeId)) return false;
            if (DataManager.isArmor(item) && isHiddenArmorType(item.atypeId)) return false;
        }
        return _Window_EquipItem_includes.call(this, item);
    };

    // アイテム一覧
    const _Window_ItemList_includes = Window_ItemList.prototype.includes;
    Window_ItemList.prototype.includes = function (item) {
        if (item) {
            if (DataManager.isItem(item) && isHiddenItemType(item.itypeId)) return false;
            if (DataManager.isWeapon(item) && isHiddenWeaponType(item.wtypeId)) return false;
            if (DataManager.isArmor(item) && isHiddenArmorType(item.atypeId)) return false;
        }
        return _Window_ItemList_includes.call(this, item);
    };

    // バトルコマンド
    const _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function () {
        _Window_ActorCommand_makeCommandList.call(this);
        this._list = this._list.filter(cmd => !(cmd.symbol === 'skill' && isHiddenSkillType(cmd.ext)));
    };
})();
