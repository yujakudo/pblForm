/**
 * cfe-tools.js
 * ツールバー
 * @copyright   2024 Yujakudo
 */

((cfe)=>{
    /**
     * デフォルトのツールバーの定義
     */
    const DEFAULT_TOOLS = {
        center: [],
        right: [ cfe.tools.Zoom ]
    };

    /**
     * ツールバー
     * @property {cfe.clsController} controller コントローラ 
     * @property {Tool[]} ツールを格納するハッシュテーブル 
     */
    cfe.clsTools = class {

        /**
         * コンストラクタ
         * @param {clsController} controller コントローラーのオブジェクト
         * @param {Object} tools ツールの定義. 未指定の場合はデフォルトが指定される. 
         */
        constructor(controller, tools) {
            tools = tools || DEFAULT_TOOLS;
            this.controller = controller;
            this.tools = {};
            //  HTMLの挿入
            this.bindHtml(tools);
            //  ツールの初期化
            this.initTools();
            //  UI を無効にしておく
            this.enableControls(false);
        }

        /**
         * ツールのHTML生成と、各ツールの格納
         * @param {Object} tools ツールの定義オブジェクト 
         */
        bindHtml(tools) {
            Object.keys(tools).forEach((part)=>{
                //  バーの位置ごとのループ
                let content = '';                
                for(const tool of tools[part]) {
                    //  ツールごとのループ
                    //  ツールのHTMLを準備
                    content += `
                        <div class="tool-in-header" id="${tool.id}">
                            ${tool.content}
                        </div>`
                    //  ツールの格納
                    this.tools[tool.id] = tool;
                }
                //  バーの part が示す位置に、HTMLを挿入する
                $('#header-' + part).html(content);
            });
        }

        /**
         * ツールの初期化
         */
        initTools() {
            //  各ツールの初期化関数の実行
            Object.keys(this.tools).forEach((id)=>{
                this.tools[id].initialize(this.controller);
            });
        }

        /**
         * ツールの値の設定
         * @param {*} value 設定する値
         * @param {string} toolId ツールID。未指定のときはvalueの全てのキーについて設定する
         * @param {string} item 項目名。未指定可。
         */
        setStatus(value, toolId, item) {
            if(undefined===toolId) {
                //  toolIdが未定義なら、values のメンバ全てについて設定の更新
                Object.keys(value).forEach((toolId)=>{
                    if(toolId in this.tools) {
                        this.#setToolStatus(value[toolId], toolId);
                    }
                });
                return;
            }
            //  toolIdの示すパネルの設定の更新
            this.#setToolStatus(value, toolId, item);
        }

        /**
         * ツールの値の設定
         * @param {*} value 設定する値
         * @param {string} toolId ツールID
         * @param {string} item 項目名。未指定のときはvalueの全てのキーについて設定する
         */
        #setToolStatus(value, toolId, item) {
            if(!(toolId in this.tools)) {
                assert(false, 'Unknown tool ID to set. id = %s.', toolId);
                return;
            }
            //  項目名が未指定の場合は、value 内の全ての項目について、自己呼び出しして設定する
            if(undefined===item) {
                Object.keys(value).forEach((item)=>{
                    this.#setToolStatus(value[item], toolId, item);
                });
                return;
            }
            //  項目名が指定されている場合.
            const tool = this.tools[toolId];
            console.assert(tool.items.includes(item), 'Unknown item to Set. item = %s, toolId = %s', item, toolId);
            //  項目名が、確かにそのツールのものなら、そのツールに値を設定する
            if( tool.items.includes(item)) {
                tool.setStatus(value, item);
            }
        }

        /**
         * ツールの値の取得
         * @param {string} toolId ツールID。未指定の場合は全てのツールの値を返す。 
         * @param {string} item 項目名。未指定の場合は全ての項目の値を返す。
         * @returns ツールの値
         */
        getStatus(toolId, item) {
            //  ツールIDが未指定なら、全てのツールについて値を取得する
            if(undefined===toolId) {
                let result ={};
                Object.keys(this.tools).forEach((toolId)=>{
                    result[toolId] = this.#getToolStatus(toolId);
                });
                return result;
            }
            //  ツールIDが指定されていたら、そのツールについて値を取得して返す。
            return this.#getToolStatus(toolId, item);
        }

        /**
         * ツールの値の取得
         * @param {string} toolId ツールID
         * @param {string} item 項目名。未指定の場合は全ての項目の値を返す。 
         * @returns {any} ツールの値
         */
        #getToolStatus(toolId, item) {
            if(!(toolId in this.tools)) {
                assert(false, 'Unknown tool ID to set. id = %s.', toolId);
                return;
            }
            const tool = this.tools[toolId];
            //  項目名が未指定の場合は、そのツールの設定項目全てについて値を取得する。
            if(undefined===item) {
                let result = {};
                for(item of tool.items) {
                    result[item] = tool.getStatus(item);
                }
                return result;
            }
            //  項目名が、確かにそのツールのものなら、ツールより値を取得
            if( tool.items.includes(item)) {
                return tool.getStatus(item);
            }
            //  項目名が、そのツールのものでない場合（エラー）
            console.assert(false, 'Unknown item to Get item = %s, toolId = %s', item, toolId);
            return undefined;
        }

        /**
         * コントロールの有効／無効を切り替える
         * @param {boolean} enable true:有効 false:無効 
         */
        enableControls(enable) {
            const $part = $('.tab-tools');
            if(enable) {
                //  有効にするのであれば、ツールバー上の全てのinput, select, buttonを有効にする。 
                $part.find('input, select, button').removeAttr('disabled');
            } else {
                //  無効にするのであれば、ツールバー上の全てのinput, select, buttonを無効にする。 
                $part.find('input, select, button').attr('disabled', true);
            }

        }
    }
    
})(pblForm);
