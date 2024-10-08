/**
 * cfe-controller.js
 * コントローラ
 * @copyright   2024 Yujakudo
 */

((cfe)=>{

    /**
     * コントローラ
     * @classdesc
     * @property {cfe.clsTabPanels} tabPanels タブパネル（ビュー）
     * @property {cfe.clsTools} tools ツールバー（ビュー）
     * @property {cfe.clsModel} model モデル
     * @property {boolean} notifyToUI trueのときUI（タブパネル）に変更通知を行う
     * @property {boolean} notifyToModel trueのときモデルに変更通知を行う
     */
    cfe.clsController = class {

        /**
         * コンストラクタ.
         * ツールボックスを生成する
         */
        constructor(settings) {
            let panelSettings, toolsSettings;
            //  タブパネルとツールの設定があったら取得する
            if(undefined!==settings) {
                panelSettings = settings.panels;
                toolsSettings = settings.tools;
            }
            //  タブパネルとツールバーの作成
            this.tabPanels = new cfe.clsTabPanels(this, panelSettings);
            this.tools = new cfe.clsTools(this, toolsSettings);
            this.model = null;
            this.notifyToUI = false;
            this.notifyToModel = false;
            //  UI を無効にする
            this.enableControls(false);
        }

        /**
         * 新規帳票作成.
         * モデルを生成し、UIを初期化する。
         * @param {string} content 帳票の文書。未指定可。 
         */
        newForm(content) {
            //  モデルの生成
            //  モデルのコンストラクタ内では、controller.model が
            //  まだ undefined なので、onModelChange が呼ばれてもUIは更新されない。
            this.model = new cfe.clsModel(this, content);
            //  拡大率を全体表示に
            // this.tools.setStatus(cfe.ZOOM_WHOLE, 'Zoom', 'index');
            //  通知をオンにして、モデルの変更通知を呼び、UI を更新する。
            this.notifyToUI = true;
            this.notifyToModel = true;
            this.onModelChange();
            //  コントロールを有効にする
            this.enableControls(true);
        }

        /**
         * コントロールの有効／無効を切り替える.
         * @param {boolean} enable true:有効。false:無効
         */
        enableControls(enable) {
            //  タブパネルとツールバーの、
            //  コントロールの有効／無効を切り替える.
            this.tabPanels.enableControls(enable);
            this.tools.enableControls(enable);
        }

        /**
         * 帳票を閉じる
         */
        closeForm() {
            //  通知、UIコントロールを無効にする
            this.notifyToUI = false;
            this.notifyToModel = false;
            this.enableControls(false);
            //  モデルを閉じて開放
            this.model.close();
            this.model = null;
        }
    
        /**
         * モデルからの設定変更通知.
         * モデルが変更されたときに呼び出される
         * @param {string} category カテゴリ名 
         * @param {string} item 項目名
         * @param {string|undefined} object 対称物名
         */
        onModelChange(category, item, object) {
            //  モデルがなかったら終了（モデル生成時）
            if(!this.model) return;
            //  モデルから、変更があった設定値を取得
            const newSettings = this.model.getSettings(category, item, object);
            if(this.notifyToUI) {
                //  UIへの通知がONであれば、モデルへの通知を一時OFFにして
                //  パネルタブへ変更の通知をする
                let back = this.notifyToModel;
                this.notifyToModel = false;
                this.tabPanels.setStatus(newSettings, category, item, object);
                this.notifyToModel = back;
            }
            //  ツールへの通知が必要な設定変更であれば、それを行う。
            if(category===undefined || category=='PaperSize') {
                this.tools.setStatus(0, 'Zoom', 'index');
            }
        }
    
        /**
         * タブパネルからの設定変更通知.
         * タブパネル上のコントロールが変更されたときに、
         * 主にパネルから直接、呼び出される
         * @param {string} category カテゴリ名 
         * @param {string} item 項目名
         * @param {string|undefined} object 対称物名
         */
        onPanelChange(newSettings, category, item) {
            if(this.model || this.notifyToModel) {
                let back = this.notifyToUI;
                this.notifyToUI = false;
                this.model.setSettings(newSettings, category, item);
                this.notifyToUI = back;
            }
        }

        /**
         * ツールバーからの設定変更通知.
         * ツールバー上のコントロールが変更／操作されたときに、
         * 主にツールから直接、呼び出される
         * @param {string} category カテゴリ名 
         * @param {string} item 項目名
         */
        onToolChange(newSettings, category, item) {

        }
    };

})(pblForm);
