/**
 * cfe-form.js
 * 帳票
 * @copyright   2024 Yujakudo
 */

((cfe)=>{

    /**
     * 新規帳票のHTML
     */
    const FORM_HTML = `
        <div class="cfe-form" >
            <script type="application/json" class="cfe-edit-data"></script>
            <div class="cfe-page">
                <canvas class="cfe-grid-layer"></canvas>
                <div class="cfe-parts-layer"></div>
                <div class="cfe-highlight-layer"></div>
            </div>
        </div>
    `

    /**
     * 用紙サイズとその幅・高さのテーブル
     */
    const PAPER_SIZES = {
        'A5': { width: 148, height: 210 },
        'B5': { width: 176, height: 250 },
        'A4': { width: 210, height: 297 },
        'B4': { width: 250, height: 353 },
        'A3': { width: 297, height: 420 }
    };

    /**
     * ptをpxに変換する係数の取得
     * @returns 係数
     */  
    function getPTtoPX() {
        return getMMtoPX() / 2.8346;
    }

    /**
     * mmをpxに変換する係数の取得
     * @returns 係数
     */  
    function getMMtoPX() {
        const $page = $('.cfe-page').eq(0);
        let width = $page.attr('style');
        let mm =width.match(/width:\s*(\d+)mm/);
        return $page.width() / parseInt(mm[1]);
    }
    
    /**
     * 帳票のビュー
     * @classdesc
     * @property {cfe.clsModel} model モデル 
     */
    cfe.clsForm = class {

        /**
         * コンストラクタ
         * @param {cfe.clsModel} model モデルのインスタンス
         * @param {string} content 帳票の文書（HTML）
         */
        constructor(model, content) {
            this.model = model;
            if(undefined===content) {
                //  文書が未指定だったら新規作成
                $('#paper-container').html(FORM_HTML);
                content = FORM_HTML;
                //  IDと名前の初期値を設定
                this.setFormAttr({
                    id: self.crypto.randomUUID(),
                    name: '未設定'
                });
            } else {
                //  指定の文書を開く
                $('#paper-container').html(content);
            }
        };

        /**
         * 帳票を閉じる
         */
        close() {
            $('#paper-container').html('');
        }

        /**
         * 文書の埋め込みデータの取得
         * @returns {Object|undefined} 埋め込みデータ
         */
        getContentData() {
            let json = $('.cfe-edit-data').html().trim();
            if(json.length>0) {
                return $.parseJson(json);
            }
            return undefined;
        }


        /**
         * 帳票の属性をセットする.
         * valueが'', null, undefinedのときは削除する
         * @param {string} values 値。attrが未指定のときはオブジェクトとみなす。
         * @param {string} attr 属性。未指定可。
         */
        setFormAttr(values, attr) {
            //  属性が未指定のときは、id, name を指定して再帰呼び出し。
            if(undefined===attr) {
                this.setFormAttr(values.id, 'id');
                this.setFormAttr(values.name, 'name');
                return;
            }

            if(values=='' || values==null) {
                //  空文字、null、undefindのときは属性を削除
                $('.cfe-form').removeAttr(attr);
            } else {
                //  属性を設定。
                $('.cfe-form').attr(attr, values);
            }
        }

        /**
         * フォームの属性値を返す。
         * @param {string} attr 属性名。idかname。未指定可。
         * @returns {string|Object} 設定値。
         *              attrが未指定のときはオブジェクトでまとめて返す。
         */
        getFormAttr(attr) {
            //  属性が未指定のときは、再帰呼び出しでid, name を取得して返す。
            if(undefined===attr) {
                return {
                    id: this.getFormAttr('id'),
                    name: this.getFormAttr('name')
                };
            }
            //  属性の値を返す。
            return $('.cfe-form').attr(attr);
        }

        /**
         * 用紙サイズの設定
         */
        setPageSize() {
            //  モデルより、用紙サイズと向きの取得
            const setting = this.model.getSettings('PaperSize');
            const $page = $('.cfe-page');
        
            // 用紙サイズを取得
            const paperSize = PAPER_SIZES[setting.size];
            // 用紙のサイズと向きを適用
            if (setting.orientation !== 'landscape') {
                //  縦
                $page.css({
                    width: `${paperSize.width}mm`,
                    height: `${paperSize.height}mm`
                });
            } else {
                //  横
                $page.css({
                    width: `${paperSize.height}mm`,
                    height: `${paperSize.width}mm`
                });
            }
        
            //  canvasのサイズを指定
            let width = $page.width();
            let height = $page.height();
            $('.cfe-grid-layer').each(function() {
                $(this).attr('width', width).attr('height', height);
            });
        }

        /**
         * グリッドの設定をする
         * @returns {Object} グリッドの座標
         */
        setGrid() {
            //  モデルより設定値を取得
            let settings = {
                PaperMargin: this.model.getSettings('PaperMargin'),
                Grid: this.model.getSettings('Grid'),
            }
            //  設定値がなければ終了
            if(undefined===settings.PaperMargin || undefined===settings.Grid) {
                return undefined;
            }
            //  描画する座標を取得して、描画する
            const axis = this.#getGridAxis(settings);
            this.#drawGrid(axis);
            //  戻り値のグリッド座標
            let gridPoints = {
                x: axis.body.x.concat(),
                y: axis.body.y.concat()
            };
            if(axis.header) {
                gridPoints.y = gridPoints.y.concat(axis.header.y);
            }
            if(axis.footer) {
                gridPoints.y = gridPoints.y.concat(axis.footer.y);
            }
            return gridPoints;
        };

        /**
         * グリッドの座標を計算する
         * @param {Object} settings マージンとグリッドの設定 
         * @returns {Object} 座標データ
         */
        #getGridAxis(settings) {
            let pt2px = getPTtoPX();    //  ptからpxへの変換係数
            let mm2px = getMMtoPX();   //  ptからpxへの変換係数
            //  分割／一定間隔
            const verticalLines = settings.Grid.verticalLines;
            const horizontalLines = settings.Grid.horizontalLines;
            //  縦線の、分割数、間隔、起点
            const verticalDivision = settings.Grid.verticalDivision;
            const verticalInterval = settings.Grid.verticalInterval * pt2px;
            const verticalStartPoint = settings.Grid.verticalStartPoint;
            //  横線の、分割数、間隔、起点
            const horizontalDivision = settings.Grid.horizontalDivision;
            const horizontalInterval = settings.Grid.horizontalInterval * pt2px;
            const horizontalStartPoint = settings.Grid.horizontalStartPoint;
            // ヘッダの描画設定
            const headerVisible = settings.Grid.headerVisible;
            const headerPosition = settings.Grid.headerPosition * mm2px;
            const headerHeight = settings.Grid.headerHeight * pt2px;
            // フッタの描画設定
            const footerVisible = settings.Grid.footerVisible;
            const footerPosition = settings.Grid.footerPosition * mm2px;
            const footerHeight = settings.Grid.footerHeight * pt2px;
            //  マージン
            const margins = {
                top: settings.PaperMargin.top * mm2px,
                bottom: settings.PaperMargin.bottom * mm2px,
                left: settings.PaperMargin.left * mm2px,
                right: settings.PaperMargin.right * mm2px,
            };
            //  戻り値の雛形
            let axis = {
                body: { x:[], y:[] },
                header: { y:[] },
                footer: { y:[] },
            }

            const $layer = $('.cfe-grid-layer').eq(0);
            const width = $layer.width();
            const height = $layer.height();

            //  線を引く領域
            //  本文の領域
            const bodyArea = {
                top: margins.top,
                bottom: height - margins.bottom,
                left: margins.left,
                right: width - margins.right,
                width: width - margins.left - margins.right,
                height: height - margins.top - margins.bottom
            };
            //  ヘッダの領域
            const headerArea = {
                top: headerPosition,
                bottom: headerPosition + headerHeight,
                height: headerHeight
            };
            //  フッタの領域
            const footerArea = {
                top: height - footerPosition - footerHeight,
                bottom: height - footerPosition,
                height: footerHeight
            };

            //  枠線を格納する
            axis.body.x.push(bodyArea.left);
            axis.body.x.push(bodyArea.right);
            axis.body.y.push(bodyArea.top);
            axis.body.y.push(bodyArea.bottom);
            axis.header.y.push(headerArea.top);
            axis.header.y.push(headerArea.bottom);
            axis.footer.y.push(footerArea.top);
            axis.footer.y.push(footerArea.bottom);

            //  縦線のX座標の計算と格納
            //  デフォルトとして、間隔は等分のときのもの、開始位置は左に。
            let spacing = bodyArea.width / verticalDivision;
            let startX = bodyArea.left;
            if (verticalLines === 'fixed') {
                //  一定間隔のときは、間隔を設定値とする
                spacing = verticalInterval;
                if (verticalStartPoint === 'right') {
                    //  起点が右なら、右端に線が乗るよう、開始位置は剰余にする
                    startX += bodyArea.width % verticalInterval;
                } else if (verticalStartPoint === 'center') {
                    //  起点が中なら、真ん中に線が乗るよう、開始位置は剰余の半分にする
                    startX += (bodyArea.width / 2) % verticalInterval;
                }
            }
            //  描画するX座標の格納
            for (let x = startX; x <= bodyArea.right; x += spacing) {
                if(!axis.body.x.includes(x)) {
                    axis.body.x.push(x);
                }
            }

            //  横線のY座標の計算と格納
            //  デフォルトとして、間隔は等分のときのもの、開始位置は上に。
            spacing = bodyArea.height / horizontalDivision;
            let startY = bodyArea.top;
            if (horizontalLines === 'fixed') {
                //  一定間隔のときは、間隔を設定値とする
                spacing = horizontalInterval;
                if (horizontalStartPoint === 'bottom') {
                    //  起点が下なら、下端に線が乗るよう、開始位置は剰余にする
                    startY += bodyArea.height % horizontalInterval;
                } else if (horizontalStartPoint === 'center') {
                    //  起点が中なら、真ん中に線が乗るよう、開始位置は剰余の半分にする
                    startY += (bodyArea.height / 2) % horizontalInterval;
                }
            }
            //  描画するY座標の格納
            for (let y = startY; y <= bodyArea.bottom; y += spacing) {
                if(!axis.body.y.includes(y)) {
                    axis.body.y.push(y);
                }
            }
            //  ヘッダ非表示なら、ヘッダの座標格納を開放
            if(!headerVisible) {
                axis.header = null;
            }
            //  フッタ非表示なら、フッタの座標格納を開放
            if(!footerVisible) {
                axis.footer = null;
            }
            return axis;
        };

        /**
         * グリッドを描画する
         * @param {Object} 座標データ 
         */
        #drawGrid(axis) {
            //  各ページのグリッドレイヤそれぞれに、グリッドを描画する
            const $gridLayers = $('.cfe-grid-layer');
            $gridLayers.each(function() {
                const $layer = $(this);
                const context = $layer[0].getContext('2d', false);
                // 既存のグリッドをクリア
                context.clearRect(0, 0, $layer.width(), $layer.height());
                //  グリッド線の太さと色
                context.lineWidth = 1;
                context.strokeStyle = 'lightgray';

                //  線の描画関数
                function line(x1, y1, x2, y2) {
                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                    context.stroke();
                }

                // 縦線を描く
                for(const x of axis.body.x) {
                    //  本文領域の縦線を描く
                    line(x, axis.body.y[0], x, axis.body.y[1]);
                    //  ヘッダがあるなら、そこにも縦線を描く
                    if (axis.header) {
                        line(x, axis.header.y[0], x, axis.header.y[1]);
                    }
                    //  フッタがあるなら、そこにも縦線を描く
                    if (axis.footer) {
                        line(x, axis.footer.y[0], x, axis.footer.y[1]);
                    }
                }
                // 横線を描く
                for(const y of axis.body.y) {
                    //  本文領域の横線を描く
                    line(axis.body.x[0], y, axis.body.x[1], y);
                }
                //  ヘッダがあるなら、その上と下の線を描く
                if (axis.header) {
                    for(let i=0; i<=1; i++) {
                        line(axis.body.x[0], axis.header.y[i], axis.body.x[1], axis.header.y[i]);
                    }
                }
                //  フッタがあるなら、その上と下の線を描く
                if (axis.footer) {
                    for(let i=0; i<=1; i++) {
                        line(axis.body.x[0], axis.footer.y[i], axis.body.x[1], axis.footer.y[i]);
                    }
                }
            });
        }
    };

})(pblForm);
