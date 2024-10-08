

((cfe)=>{

    cfe.SUBCATEGORY_SEPALATER = '_';

    /**
     * クラス：入れ子のパネル
     */
    cfe.panel.clsPanelNesting = class extends cfe.panel.clsPanel {

        subPanels;

        constructor(controller) {
            super(controller);
            this.subPanels = {};
        }

        /**
         * イベントハンドラの登録
         * @param {jQuery} $container コンテナのjQueryオブジェクト 
         */
        bind($container) {
            super.bind($container);
            const subPanelList = cfe.SETTING_ITEMS[this.category].subCategories;
            const $subPanelContainer = $container.find('.sub-panels');
            this.#bindSubPanelsHtml($subPanelContainer, subPanelList);
            this.#initSubPanels($subPanelContainer);
        }
    
        /**
         * サブパネルのHTML生成と、各パネルの格納
         * @param {Object} tabs タブの定義オブジェクト 
         */
        #bindSubPanelsHtml($container, subPanelList) {
            // タブの作成
            let tabLinks = '';
            let tabContents = '';
            for(const subCategory of subPanelList) {
                const categoryInfo = cfe.SETTING_ITEMS[subCategory];
                //  タブリストのHTMLを準備
                const tab_id = this.category + cfe.SUBCATEGORY_SEPALATER + subCategory;
                tabLinks += `<button class="sub-panel-link" data-tab="${tab_id}">${categoryInfo.label}</button>`;
                let content = '';
                //  パネルを生成して格納
                this.subPanels[subCategory] = new cfe.panel['cls' + subCategory](this);
                //  パネルのHTMLの準備
                content += `<div class="panel-in-tab" id="panel-${tab_id}">`
                    + this.subPanels[subCategory].getContent() + '</div>'
                //  パネルのHTMLを挿入して、タブ本体のHTMLを準備
                tabContents += `<div class="sub-panel-content" id="${tab_id}" style="display: none;">${content}</div>`;
            }
            //  コンテナにタブのHTMLを挿入
            $container.html(`
                <div class="sub-panel-links">${tabLinks}</div>
                <div class="sub-panel-contents">${tabContents}</div>
            `);
        };

        /**
         * サブパネルの初期化.
         * サブパネルの、イベントハンドラの定義と初期化
         */
        #initSubPanels($container) {
            //  各パネルの、初期化関数の実行
            Object.keys(this.subPanels).forEach((subCategory)=>{
                const tab_id = this.category + cfe.SUBCATEGORY_SEPALATER + subCategory;
                const $elem = $(`#panel-${tab_id}`);
                this.subPanels[subCategory].bind($elem);
            });
            // 初期表示設定として、先頭のタブをアクティブに
            $container.find('.sub-panel-content').first().show();
            $container.find('.sub-panel-link').first().addClass('active');

            // クリック時の処理
            $container.find('.sub-panel-link').on('click', function() {
                const targetTab = $(this).data('tab');

                // タブリンクのアクティブ状態を更新
                $container.find('.sub-panel-link').removeClass('active');
                $container.find(this).addClass('active');

                // タブコンテンツの表示切替
                $container.find('.sub-panel-content').hide();
                $container.find(`#${targetTab}`).show();
            });
        }

        /**
         * サブパネルからの設定変更通知.
         * サブパネルのコントロールが変更されたときに呼び出される
         * 項目名を替えて、コントローラのonPanelChangeを呼びだす。
         * @param {any} value 値
         * @param {string} subCategory サブカテゴリ名 
         * @param {string} item 項目名
         */
        onPanelChange(value, subCategory, item) {
            item = subCategory + cfe.SUBCATEGORY_SEPALATER + item;
            this.controller.onPanelChange(value, this.category, item);
        }

        /**
         * UIの状態の取得
         * @param {string} item 項目名
         * @returns {string} UIの状態の値
         */
        getStatus(item) {
            // 項目名が「カテゴリ_項目名」だったら、
            // そのカテゴリの getStatus を呼び、その値を返す
            if(item.includes(cfe.SUBCATEGORY_SEPALATER)) {
                const subitems = item.split(cfe.SUBCATEGORY_SEPALATER);
                return this.subPanels[subitems[0]].getStatus(subitems[1]);
            }
            //  普通に（clsPanelで）値を返す
            return super.getStatus(item);
        }

        /**
         * UIに状態を設定する
         * @function
         * @param {string} value 設定する値
         * @param {string} item 項目名 
         */
        setStatus(value, item) {
            // 項目名が「カテゴリ_項目名」だったら、
            // そのカテゴリの setStatus を呼び、値を設定する
            if(item.includes(cfe.SUBCATEGORY_SEPALATER)) {
                const subitems = item.split(cfe.SUBCATEGORY_SEPALATER);
                this.subPanels[subitems[0]].setStatus(value, subitems[1]);
                //  パネルに onSetStaus メソッドがあればコールする。
                if(this.onSetStaus) {
                    let newValue = this.onSetStaus(value, item);
                }
                return;
            }
            //  普通に（clsPanelで）値を設定する
            return super.setStatus(value, item);
        }
    }

})(pblForm);