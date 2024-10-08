/**
 * cfe-model.js
 * モデル
 * @copyright   2024 Yujakudo
 */

((cfe)=>{

    /**
     *  モデルで保持する設定値のカテゴリ名
     */
    const STORE_CATEGORY = [
        'PaperSize', 'PaperMargin', 'Grid', 'Box',
    ]

    /**
     * undoバッファのサイズ.
     */
    const UNDO_BUFFER_SIZE = 100;

    /**
     * エディタのモデル.
     * コントローラと帳票の橋渡しを行う.
     * @classdesc
     * @property {cfe.clsController} controller コントローラ 
     * @property {Object} settings 設定値
     * @property {Object} gridPoints グリッドの座標データ 
     * @property {cfe.clsForm} form 帳票オブジェクト
     * @property {boolean} managingUndo trueのとき、undoバッファに対して処理を行っている。
     *                      よってtrueのときはUndoバッファにコマンドを積まない。 
     * @property {Object[]} undoBuffer Undo バッファ 
     * @property {number} undoBufferIndex Undo バッファの、次に書き込む場所を示すインデックス 
     * @property {number} savePoint 保存されたときの、Undo バッファのインデックス。 
     */
    cfe.clsModel = class {
        
        /**
         * コンストラクタ
         * @param {cfe.clsController} controller コントローラーのインスタンス 
         * @param {string|undefined} content 帳票の文書。
         *                  未指定の場合はデフォルトの白紙帳票を生成。 
         */
        constructor(controller, content) {
            this.controller = controller;
            this.settings = {};
            this.gridPoints = null;
            //  帳票を生成し、設定を取得してモデルに設定
            this.form = new cfe.clsForm(this, content);
            let settings = this.form.getContentData();
            settings = Object.assign(cfe.getDefaultSettings(), settings);
            this.managingUndo = true;
            this.setSettings(settings);
            //  undoバッファの初期化
            this.undoBuffer = null;
            this.undoBufferIndex = 0;
            this.savePoint = 0;
            this.managingUndo = false;
        };

        /**
         * モデルの終了処理
         */
        close() {
            //  帳票を閉じてバッファを解放
            this.form.close();
            this.form = null;
            this.settings = null;
            this.undoBuffer = null;
        }

        /**
         * 設定を取得する
         * @param {string} category カテゴリ。省略した場合、全設定を取得。
         * @param {string} item 項目。省略した場合、カテゴリ内の全項目を取得。
         * @param {string} object 設定対象。項目によっては未指定の場合もありうる。
         * @returns 設定値。あるいは設定値のオブジェクト
         */
        getSettings(category, item, object) {
            if(undefined===category) {
                //  カテゴリが未指定だったら全データを返す。
                //  デフォルト設定内のカテゴリ名全てについて、自己呼び出しして値を取得する。
                let result = {};
                Object.keys(cfe.SETTING_ITEMS).forEach((category)=>{
                    result[category] = this.getSettings(category);
                });
                return result;
            }
            //  カテゴリ名が指定されている場合
            if(STORE_CATEGORY.includes(category)) {
                //  モデル内で保持するカテゴリならば、モデルの保存庫から返す。
                return this.#loadSettings(category, item);
            }
            //  モデル内で保持するカテゴリではない場合
            switch(category) {
                //  フォームから値を取得する
                case 'Form':
                    return this.form.getFormAttr(item);
                    break;
            };
            return undefined;
        }

        /**
         * 設定を更新する
         * @param {*} values 設定値。
         * @param {string} category カテゴリ。省略した場合、values内の各キーを更新。
         * @param {string} item 項目。省略した場合、カテゴリ内の全項目を更新。
         * @param {string} object 設定対象。項目によっては未指定の場合もありうる。
         */
        setSettings(values, category, item, object) {
            //  カテゴリが未指定だったらハッシュテーブルなので、valuesのキーをカテゴリとして自己呼び出し。
            if(undefined===category) {
                Object.keys(values).forEach((category)=>{
                    this.setSettings(values[category], category, undefined, object);
                });
                return;
            }
            //  undoバッファに積む
            this.#stackUndoBuffer(values, category, item, object);
            //  保持する設定だったらストア
            if(STORE_CATEGORY.includes(category)) {
                this.#storeSettings(values, category, item);
            }
            //  帳票に適用し、コントローラに変更を知らせる
            this.#applyToForm(values, category, item);
            this.controller.onModelChange(category, item);
        }

        /**
         * 保存庫より設定を取得する.
         * @param {string} category カテゴリ 
         * @param {string} item 項目。未指定可。
         */
        #loadSettings(category, item) {
            //  項目が未指定だったらカテゴリ全てを返す。
            if(undefined===item) {
                return this.settings[category];
            }
            //  項目が存在しなければ undefined を返す
            if( !(item in this.settings[category]) ) {
                return undefined;
            }
            //  項目の設定値を返す。
            return this.settings[category][item];
        }

        /**
         * 設定を保存する.
         * @param {any} values 設定値
         * @param {string} category カテゴリ
         * @param {string} item 項目 。未指定可。
         */
        #storeSettings(values, category, item) {
            //  カテゴリが保存庫になかったら作成する
            if( !(category in this.settings) ) {
                this.settings[category] = {};
            }
            if(undefined===item) {
                //  項目が未指定だったら、valuesの中にある項目を保存
                Object.keys(values).forEach((item) => {
                    this.settings[category][item] = values[item];
                });
            } else {
                //  項目の設定値を保存。
                this.settings[category][item] = values;
            }
        }

        /**
         * 帳票に設定を反映させる
         * @param {any} values 
         * @param {string} category カテゴリ 
         * @param {string} item 項目
         * @param {string} object 対象
         */
        #applyToForm(values, category, item, object) {
            switch(category) {
                case 'Form':
                    this.form.setFormAttr(values, item);
                    break;
                case 'PaperSize':
                    this.form.setPageSize();
                    //  グリッドを描画し直すのでbreakしない
                case 'PaperMargin':
                case 'Grid':
                    this.gridPoints = this.form.setGrid();
                    break;
            }
        }

        /**
         * セーブポイントのセット
         * 保存時にコールする。
         */
        setSavePoint() {
            this.savePoint = this.undoBufferIndex;
        }

        /**
         * 保存後、変更はあったか？
         * @returns {boolean} true:変更あり。false:変更なし
         */
        hasChanged() {
            return !(this.undoBufferIndex==this.savePoint);
        }

        /**
         * undoバッファにコマンドを積む
         * @param {*} values 設定値。
         * @param {string} category カテゴリ。省略した場合、values内の各キーを更新。
         * @param {string} item 項目。省略した場合、カテゴリ内の全項目を更新。
         * @param {string} object 設定対象。項目によっては未指定の場合もありうる。
         */
        #stackUndoBuffer(newValues, category, item, object) {
            if(this.managingUndo) {
                return;
            }
            let cmd = {
                category: category,
                item: item,
                object: object,
                from: this.getSettings(category, item, object),
                to: newValues
            };
            if(this.undoBufferIndex==0){
                //  インデックス（これから入れる位置）が０なら、バッファを空にする
                this.undoBuffer = [];
            } else if(this.undoBufferIndex < this.undoBuffer.length ) {
                //  インデックスがバッファ長より小さければ、バッファのインデックス以降を切り捨てる。
                this.undoBuffer = this.undoBuffer.slice(0, this.undoBufferIndex - 1);
            }
            //  コマンドの圧縮
            /** @todo 特定のコマンドのみ圧縮するようにする */
            //  バッファにコマンドがあり、保存直後でなかったらコマンドの圧縮を試みる
            if(this.undoBufferIndex>0 && this.undoBufferIndex!=this.savePoint) {
                let prevCmd = this.undoBuffer[this.undoBufferIndex - 1];
                if(cmd.category==prevCmd.category && cmd.item==prevCmd.item && cmd.object==prevCmd.object) {
                    if(prevCmd.from!==cmd.to) {
                        prevCmd.to = cmd.to;
                        // this.undoBuffer[this.undoBufferIndex - 1] = cmd;
                        return;
                    }
                }
            }
            //  新しいコマンドをバッファに積む
            this.undoBuffer.push(cmd);
            this.undoBufferIndex++;
            //  バッファサイズが既定値より多ければ、一つ減らす。
            if(this.undoBuffer.length > UNDO_BUFFER_SIZE) {
                this.undoBuffer.shift();
                this.undoBufferIndex--;
                if(this.savePoint>=0) {
                    this.savePoint--;
                }
            }
        }

        /**
         * undo:取り消し
         */
        undo() {
            if (this.canUndo()) {
                this.managingUndo = true;
                //  インデックスを一つ戻してからコマンドを取り出し再設定
                let cmd  = this.undoBuffer[--this.undoBufferIndex];
                this.setSettings(cmd.from, cmd.category, cmd.item, cmd.object);
                this.managingUndo = false;
            }
        }

        /**
         * Undo可能か？
         * @returns {boolean} true：可能　false：不可
         */
        canUndo() {
            return (this.undoBufferIndex > 0);
        }

        /**
         * redo:やり直し
         */
        redo() {
            if (this.canRedo()) {
                this.managingUndo = true;
                //  コマンドを取り出し再設定。インデックスを進める
                let cmd  = this.undoBuffer[this.undoBufferIndex++];
                this.setSettings(cmd.to, cmd.category, cmd.item, cmd.object);
                this.managingUndo = false;
            }
        }

        /**
         * Redo可能か？
         * @returns {boolean} true：可能　false：不可
         */
        canRedo() {
            return (this.undoBufferIndex < this.undoBuffer.length);
        }

    }
})(pblForm);
