/**
 * panels/pnl-box.js
 * フォント・枠線 設定パネル
 * @copyright   2024 Yujakudo
 */

((cfe) => {
 
    /**
     * クラス：フォント設定パネル
     */
    cfe.panel.clsFont = class extends cfe.panel.clsPanel {

        constructor(controller) {
            super(controller);
            this.category = 'Font';
            this.content = `
                <div class="panel-container font-settings">
                    <!--  フォント  -->
                    <div class="panel-row">
                        <$ input:fontName $>
                        <$ input:fontColor $>
                    </div>
                    <div class="panel-row">
                        <div>
                            <$ label:fontSize $>
                            <$ input:fontSize $>
                        </div>
                        <div>
                            <div class="parallel-in-row">
                                <$ input:bold $>
                            </div>
                            <div class="parallel-in-row">
                                <$ input:italic $>
                            </div>
                        </div>
                    </div>
                    <!--  下線  -->
                    <div class="panel-row">
                        <$ label:underline $>
                        <$ input:underline $>
                        <$ input:underlineColor $>
                    </div>
                </div>
            `;
        }
    }

    /**
     * クラス：枠線設定パネル
     */
    cfe.panel.clsLine = class extends cfe.panel.clsPanel {

        constructor(controller) {
            super(controller);
            this.category = 'Line';
            this.content = `
            <div class="panel-container line-settings">
                <div class="panel-row">
                    <$ label:lineType $>
                    <$ input:lineType $>
                    <$ input:lineColor $>
                </div>
                <div class="panel-row">
                    <$ label:lineWidth $>
                    <$ input:lineWidth $>
                </div>
                <div class="panel-row">
                    <$ label:borderRadius $>
                    <$ input:borderRadius $>
                </div>
            </div>
            `;
        }

        /**
         * 辺に対するinputの有効／無効を切り返る
         * @param {boolean} enable true:有効　false:無効 
         */
        enableEgdeControls(enable) {
            this.$container.find(
                `input[data-item="lineType"],
                 input[data-item="lineColor"], 
                 input[data-item="lineWidth"]`
            ).prop('disabled', !enable);
        }

        /**
         * 角に対するinputの有効／無効を切り返る
         * @param {boolean} enable true:有効　false:無効 
         */
        enableCornerControls(enable) {
            this.$container.find(
                `input[data-item="borderRadius"]`
            ).prop('disabled', !enable);
        }
    }

    /**
     * クラス：テキスト配置パネル
     */
    cfe.panel.clsTextAlignment = class extends cfe.panel.clsPanel {
        constructor(controller) {
            super(controller);
            this.category = 'TextAlignment';
            this.content = `
                <div class="panel-container text-alignmet-settings">
                    <div class="alignment-item">
                        <div class="panel-row">
                            <$ label:vertical $>
                            <$ input:vertical $>
                            <$ label:horizontal $>
                            <$ input:horizontal $>
                        </div>
                    </div>
                    <div class="panel-row">
                        <$ input:shrinkToFit $>
                    </div>
                    <div class="panel-row">
                        <$ input:verticalWriting $>
                    </div>
                    <div class="panel-row">
                        <label>パディング:</label>
                    </div>
                    <div class="padding-grid">
                        <div class="panel-row padding-item">
                            <$ label:paddingTop $>
                            <$ input:paddingTop $>
                        </div>
                        <div class="has-link-button">
                            <$ input:paddingLinkTopBottom $>
                        </div>
                        <div class="panel-row padding-item">
                            <$ label:paddingBottom $>
                            <$ input:paddingBottom $>
                        </div>
                        <div class="panel-row padding-item">
                            <$ label:paddingLeft $>
                            <$ input:paddingLeft $>
                        </div>
                        <div class="has-link-button">
                            <$ input:paddingLinkLeftRight $>
                        </div>
                        <div class="panel-row padding-item">
                            <$ label:paddingRight $>
                            <$ input:paddingRight $>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * クラス：角丸パネル
     */
    cfe.panel.clsBorderRadius = class extends cfe.panel.clsPanel {
        constructor(controller) {
            super(controller);
            this.category = 'BorderRadius';
            this.content = `
                <div class="panel-container border-radius-settings">
                    <div class="panel-row padding-item">
                        <$ label:topLeft $>
                        <$ input:topLeft $>
                        <span class="spacing">&nbsp;</span>
                        <$ label:topRight $>
                        <$ input:topRight $>
                    </div>
                    <div class="has-link-button">
                        <$ input:borderRadiusLink $>
                    </div>
                    <div class="panel-row padding-item">
                        <$ label:bottomLeft $>
                        <$ input:bottomLeft $>
                        <span class="spacing">&nbsp;</span>
                        <$ label:bottomRight $>
                        <$ input:bottomRight $>
                    </div>
                </div>
            `;
        }
    }

    /**
     * クラス：ボックスパネル
     */
    cfe.panel.clsBox = class extends cfe.panel.clsPanelNesting {

        /**
         * コンストラクタ
         * @param {clsController} controller 
         */
        constructor(controller) {
            super(controller);
            this.category = 'Box';
            this.content = `
                <div class="panel-container box-selection">
                    <div class="box-diagram">
                        <div class="corner top-left">
                            <input type="checkbox" class="box-corner top-left" />
                        </div>
                        <div class="edge top">
                            <input type="checkbox" class="box-edge top" />
                        </div>
                        <div class="corner top-right">
                            <input type="checkbox" class="box-corner top-right" />
                        </div>
                        <div class="edge left">
                            <input type="checkbox" class="box-edge left" />
                        </div>
                        <div id="cfe-box-visual">
                            <!-- ボックスの中央を示す -->
                        </div>
                        <div class="edge right">
                            <input type="checkbox" class="box-edge right" />
                        </div>
                        <div class="corner bottom-left">
                            <input type="checkbox" class="box-corner bottom-left" />
                        </div>
                        <div class="edge bottom">
                            <input type="checkbox" class="box-edge bottom" />
                        </div>
                        <div class="corner bottom-right">
                            <input type="checkbox" class="box-corner bottom-right" />
                        </div>
                    </div>
                    <div class="box-controls">
                        <button class="select-all">全選択</button>
                        <button class="deselect-all">選択解除</button>
                    </div>
                    <div class="sub-panels">
                        <!-- サブパネル -->
                    </div>
                </div>
            `;
        }

        /**
         * イベントハンドラの登録
         * @param {jQuery} $container コンテナのjQueryオブジェクト 
         */
        bind($container) {
            super.bind($container);
            var _this_ = this;
            this.preview = new cfe.clsBox($('#cfe-box-visual'));
            
            // 全選択ボタンの処理
            $container.find('.select-all').on('click', function() {
                //  全てのチェックボックスを選択
                $container.find('.box-diagram input[type="checkbox"]').prop('checked', true);
                //  Lineサブパネル内のinputの有効／無効の切り替え
                _this_.#setLineControlEnable();
            });

            // 選択解除ボタンの処理
            $container.find('.deselect-all').on('click', function() {
                //  全てのチェックボックスを選択解除
                $container.find('.box-diagram input[type="checkbox"]').prop('checked', false);
                _this_.#setLineControlEnable();
            });
            
            // 辺のチェックボックスの処理
            $container.find('input.box-edge').on('click', function() {
                let value = $(this).prop('checked');
                let classes = $(this).attr('class').split(' ');
                let where = (classes[1]!=='box-edge')? classes[1]: classes[0];
                let corners = [
                    'top-left', 'top-right', 'bottom-left', 'bottom-right'
                ].filter((name)=>{
                    return name.includes(where);
                });
                for(const corner of corners) {
                    $container.find('input.' + corner).prop('checked', value);
                }
                //  Lineサブパネル内のinputの有効／無効の切り替え
                _this_.#setLineControlEnable();
            });

            // チェックボックスの処理
            $container.find('input.box-corner').on('click', function () {
                _this_.#setLineControlEnable();
            });
        }

        /**
         * サブパネルからの設定変更通知.
         * サブパネルのコントロールが変更されたときに呼び出される
         * @param {any} value 値
         * @param {string} subCategory サブカテゴリ名 
         * @param {string} item 項目名
         */
        onPanelChange(value, subCategory, item) {
            //  サブカテゴリがLineでなかったら、親の処理を行う。
            if(subCategory!=='Line') {
                super.onPanelChange(value, subCategory, item);
                return;
            }
            //  サブカテゴリがLineのとき
            //  arrCheckedに、チェックされている辺または角の配列を得る
            const idx = (item==='borderRadius')? 1: 0;
            const arrChecked = this.#getSelectedEdgeAndCorner()[idx];
            //  チェックがなければ終了
            if(arrChecked.length==0) return;
            //  項目名：値のオブジェクトを組み上げる
            let values = {};
            for(const part of arrChecked) {
                values[part + cfe.SUBCATEGORY_SEPALATER + item] = value;
            }
            //  コントローラに知らせる
            this.controller.onPanelChange(values, this.category);
        }

        /**
         * UIの状態の取得
         * @param {string} item 項目名
         * @returns {string} UIの状態の値
         */
        getStatus(item) {
            const subitems = item.split(cfe.SUBCATEGORY_SEPALATER);
            return this.preview.getSetting(subitems[0], subitems[1]);
        }

        /**
         * UIに状態を設定する
         * @function
         * @param {string} value 設定する値
         * @param {string} item 項目名 
         */
        setStatus(value, item) {
            const subitems = item.split(cfe.SUBCATEGORY_SEPALATER);
            const partIdx = cfe.isBoxPart(subitems[0]);
            //  サブカテゴリが辺または角でなければ、親の処理を行う
            if(0==partIdx) {
                super.setStatus(value, item);
                return;
            }
            //  サブカテゴリが辺または角のとき
            //  プレビューを変更する
            this.preview.setSettings(value, subitems[0], subitems[1]);
            //  枠のコントロールの変更
            this.#setLineControlStatus(subitems[1]);
        }

        #setLineControlEnable() {
            //  コントロールの有効／無効の切り替え
            const arrChecked = this.#getSelectedEdgeAndCorner();
            this.subPanels.Line.enableEgdeControls(arrChecked[0].length>0);
            this.subPanels.Line.enableCornerControls(arrChecked[1].length>0);
            //  コントロールの値を設定
            this.#setLineControlStatus();
        }

        /**
         * 枠線のコントロールをセットする。
         * プレビューのチェックされている辺・角について、
         * 同じ値であれば、その値をコントロールにセットする
         * 同じ値でなければ、空白をコントロールにセットする
         * @param {string|undefined} item 項目名.
         *              省略されたときは、全ての項目について再帰的に行う。
         * @param {string[][]|undefined} checkedPatrs 
         *              チェックされている辺・角の配列。再帰呼び出しのときのみ指定
         */
        #setLineControlStatus(item, checkedPatrs) {
            if(undefined===item) {
                checkedPatrs = this.#getSelectedEdgeAndCorner();
                Object.keys(cfe.SETTING_ITEMS.Line.items).forEach((item)=>{
                    this.#setLineControlStatus(item, checkedPatrs);
                });
                return;
            }
            //  再帰呼び出しでないときは、ここでチェックされている辺・角を取得
            if(undefined===checkedPatrs) {
                checkedPatrs = this.#getSelectedEdgeAndCorner();
            }
            //  arrCheckedに、チェックされている辺または角の配列を得る
            const idx = (item==='borderRadius')? 1: 0;
            const arrChecked = checkedPatrs[idx];
            let value = '';
            if(arrChecked.length==0) {
                //  チェックされている辺・角の項目値が一種類なら、
                //  コントロールにその値をセット
                //  2種類以上なら、空白にする
                const values = new Set(
                    this.preview.getLineSetting(arrChecked)
                );
                if(values.size==1) value = values.values(0);
            }
            this.subPanels['Line'].setStatus(value, item);
        }

        /**
         * 値がセットされたときに呼ばれる処理
         * itemが'Line'（枠線）でないときに、setStatusから呼ばれる
         * プレビューの見た目を変える
         * @param {any} value 値
         * @param {string} item 項目
         */
        onSetStaus(value, item) {
            const subitems = item.split(cfe.SUBCATEGORY_SEPALATER);
            this.preview.setSettings(value, subitems[0], subitems[1]);
        }

        /**
         * サブカテゴリがLineの場合に、選択されている辺・角を取得し、
         * それぞれについての項目名・値をセットしたオブジェクトを返す
         * @param {any} value 値
         * @param {string} item 項目名 
         * @returns {Object}    以下の形式のオブジェクト
         *                      [辺または角].[項目名]: 値
         */
        #getLineStatus(value, item) {
            const selected = this.#getSelectedEdgeAndCorner();
            let status= {};
            if(item==='borderRadius') {
                for(let corner of selected[1]) {
                    status[corner] = {item: item, value: value};
                }
            } else {
                for(let edge of selected[0]) {
                    status[edge] = {item: item, value: value};
                }
            }
            return status;
        }

        /**
         * 選択されている辺・角の取得
         * @returns {[string[]]} 選択されている[[辺][角]]
         */
        #getSelectedEdgeAndCorner() {
            let selected = [[], []];
            this.$container.find('.box-diagram input[type="checkbox"]')
            .each(function() {
                $chk = $(this);
                if($chk.prop('checked')) {
                    const classes = $(this).attr('class').split();
                    if(classes[0]==='box-edge') {
                        selected[0].push(classes[1]);
                    } else if(classes[0]==='box-corner') {
                        selected[1].push(classes[1]);
                    }
                }
            });
            return selected;
        }
    }

})(pblForm);
