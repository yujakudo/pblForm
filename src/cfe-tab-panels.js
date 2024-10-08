/**
 * cfe-tab-panels.js
 * タブパネル
 * @copyright   2024 Yujakudo
 */

((cfe)=>{
    /**
     * デフォルトのタブ定義
     */
    const DEFAULT_TABS = [
        {
            id: 'tab-box-settings',
            label: 'ボックス',
            panels: [ 'Box' ],
        },
        {
            id: 'tab-paper-settings',
            label: '用紙',
            panels: [ 'PaperSize', 'PaperMargin', 'Grid' ],
        },
        { id: 'tab3', label: 'Tab 3', panels: [] }
    ];

    cfe.COLOR_PICKER_OPTIONS = [
        "#000000",	"#444444",	"#888888",	"#cccccc",	"#ffffff",
        "#ff0000",	"#ea9999",	"#e06666",	"#990000",	"#660000",
        "#ff9900",	"#f9cb9c",	"#f6b26b",	"#b45f06",	"#783f04",
        "#ffff00",	"#ffe599",	"#ffd966",	"#bf9000",	"#7f6000",
        "#00ff00",	"#b6d7a8",	"#93c47d",	"#38761d",	"#274e13",
        "#00ffff",	"#a2c4c9",	"#76a5af",	"#134f5c",	"#0c343d",
        "#0000ff",	"#9fc5e8",	"#6fa8dc",	"#0b5394",	"#073763",
        "#9900ff",	"#b4a7d6",	"#8e7cc3",	"#351c75",	"#20124d",
        "#ff00ff",	"#d5a6bd",	"#c27ba0",	"#741b47",	"#4c1130"
    ];

    /**
     * タブパネル.
     * 右サイドバーの設定パネル
     * @classdesc
     * @property {cfe.clsController} controller コントローラ 
     * @property {Panel[]} panels パネルを格納するハッシュテーブル。 
     *              キーはパネルのID。
     */
    cfe.clsTabPanels = class  {

        /**
         * コンストラクタ
         * @param {clsController} controller コントローラーのオブジェクト
         * @param {Object} tabs タブの定義. 未指定の場合はデフォルトが指定される. 
         */
        constructor(controller, tabs) {
            tabs = tabs || DEFAULT_TABS;
            this.controller = controller;
            this.panels = {};
            //  各パネルのHTMLの挿入
            this.bindHtml(tabs);
            //  各パネルの初期化
            this.initTabs();
            //  UI を無効にしておく
            this.enableControls(false);
        }

        /**
         * タブパネルのHTML生成と、各パネルの格納
         * @param {Object} tabs タブの定義オブジェクト 
         */
        bindHtml(tabs) {
            // タブの作成
            let tabLinks = '';
            let tabContents = '';
            tabs.forEach(tab => {
                //  タブごとのループ
                //  タブリストのHTMLを準備
                tabLinks += `<button class="tab-link" data-tab="${tab.id}">${tab.label}</button>`;
                let content = '';
                tab.panels.forEach(category => {
                    //  パネルごとのループ
                    const categoryInfo = cfe.SETTING_ITEMS[category];
                    //  パネルを生成して格納
                    this.panels[category] = new cfe.panel['cls' + category](this.controller);
                    //  パネルのHTMLの準備
                    content += `<div class="panel-in-tab" id="panel-${category}">
                        <h3>${categoryInfo.label}</h3>`
                        + this.panels[category].getContent() + '</div>'
                });
                //  パネルのHTMLを挿入して、タブ本体のHTMLを準備
                tabContents += `<div class="tab-content" id="${tab.id}" style="display: none;">${content}</div>`;
            });
            //  カラーピッカーのオプション
            const colors = cfe.COLOR_PICKER_OPTIONS.map(
                (color)=>`<option value="${color}">`
            ).join('');
            //  コンテナにタブのHTMLを挿入
            $('#tab-panels').html(`
                <div class="tab-links">${tabLinks}</div>
                <div class="tab-contents">${tabContents}</div>
                <datalist id="default-colors">${colors}</datalist>
            `);

        };

        /**
         * タブとパネルの初期化.
         * タブとパネルの、イベントハンドラの定義と初期化
         */
        initTabs() {
            //  各パネルの、初期化関数の実行
            Object.keys(this.panels).forEach((category)=>{
                const $elem = $(`#panel-${category}`);
                this.panels[category].bind($elem);
            });
            // 初期表示設定として、先頭のタブをアクティブに
            $('.tab-content').first().show();
            $('.tab-link').first().addClass('active');

            // クリック時の処理
            $('.tab-link').on('click', function() {
                const targetTab = $(this).data('tab');

                // タブリンクのアクティブ状態を更新
                $('.tab-link').removeClass('active');
                $(this).addClass('active');

                // タブコンテンツの表示切替
                $('.tab-content').hide();
                $(`#${targetTab}`).show();
            });
        }

        /**
         * パネルUIの設定値の設定
         * @param {*} value 設定する値
         * @param {string} category カテゴリ。未指定のときはvalueの全てのキーについて設定する
         * @param {string} item 項目名。未指定可。
         */
        setStatus(value, category, item) {
            if(undefined===value) {
                return;
            }
            if(undefined===category) {
                //  categoryが未指定なら、value のメンバ全てについて設定の更新
                Object.keys(value).forEach((category)=>{
                    if(category in this.panels && undefined!==value[category]) {
                        this.#setPanelStatus(value[category], category);
                    }
                });
                return;
            }
            //  categoryの示すパネルの設定の更新
            this.#setPanelStatus(value, category, item);
        }

        /**
         * パネルUIの設定値の設定
         * @param {*} value 設定する値
         * @param {string} category カテゴリ
         * @param {string} item 項目名。未指定のときはvalueの全てのキーについて設定する
         */
        #setPanelStatus(value, category, item) {
            if(!(category in this.panels)) {
                assert(false, 'Unknown category(%s) to set.', category);
                return;
            }
            //  項目名が未指定の場合は、value 内の全ての項目について、自己呼び出しして設定する
            if(undefined===item) {
                Object.keys(value).forEach((item)=>{
                    this.#setPanelStatus(value[item], category, item);
                });
                return;
            }
            //  項目名が指定されている場合.
            const categoryInfo = cfe.SETTING_ITEMS[category];
            console.assert((item in categoryInfo.items), 
                'Unknown item to Set. item = %s, category = %s', item, category);
            //  項目名が、カテゴリのものなら、そのパネルに値を設定する
            if(item in categoryInfo.items) {
                this.panels[category].setStatus(value, item);
            }
        }

        /**
         * パネルUI上の設定値の取得
         * @param {string} category カテゴリ。未指定の場合は全てのカテゴリの設定値を返す。 
         * @param {string} item 項目名。未指定の場合は全ての項目の設定値を返す。
         * @returns UI上の設定値
         */
        getStatus(category, item) {
            //  カテゴリが未指定なら、全てのパネルについて値を取得する
            if(undefined===category) {
                let result ={};
                Object.keys(this.panels).forEach((category)=>{
                    result[category] = this.#getPanelStatus(category);
                });
                return result;
            }
            //  カテゴリが指定されていたら、そのパネルについて値を取得して返す。
            return this.#getPanelStatus(category, item);
        }

        /**
         * パネルUI上の設定値の取得
         * @param {string} category カテゴリ
         * @param {string} item 項目名。未指定の場合は全ての項目の設定値を返す。 
         * @returns UI上の設定値
         */
        #getPanelStatus(category, item) {
            if(!(category in this.panels)) {
                assert(false, 'Unknown category(%s) to get.', category);
                return;
            }
            const categoryInfo = cfe.SETTING_ITEMS[category];
            //  項目名が未指定の場合は、そのパネルの設定項目全てについて値を取得する。
            if(undefined===item) {
                let result = {};
                Object.keys(categoryInfo.items).forEach((item)=>{
                    result[item] = this.panels[category].getStatus(item);
                });
                return result;
            }
            //  項目名が、確かにそのパネルのものなら、パネルより値を取得
            if( item in categoryInfo.items) {
                return this.panels[category].getStatus(item);
            }
            //  項目名が、そのパネルのものでない場合（エラー）
            console.assert(false, 'Unknown item to Get item = %s, category = %s', item, category);
            return undefined;
        }

        /**
         * コントロールの有効／無効を切り替える
         * @param {boolean} enable true:有効 false:無効 
         */
        enableControls(enable) {
            const $tabPanels = $('#tab-panels');
            if(enable) {
                //  有効にするのであれば、タブパネル上の全てのinput, select, buttonを有効にする。 
                $tabPanels.find('input, select, button').removeAttr('disabled');
            } else {
                //  無効にするのであれば、タブパネル上の全てのinput, select, buttonを無効にする。 
                $tabPanels.find('input, select, button').attr('disabled', true);
            }

        }
    }
})(pblForm);
