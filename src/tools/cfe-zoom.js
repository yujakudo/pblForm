/** 
 * tools/cfe-zoom.js
 * 拡大率設定ツール
 * @copyright   2024 Yujakudo
 */

((cfe)=>{

    /**
     * 拡大率の更新
     * 拡大率をフォーム表示領域に設定する
     * @param {number} zoomLevel 拡大率(0 - 2.0)
     */
    function updateZoom(zoomLevel) {
        //  無効な値の修正
        if(isNaN(zoomLevel)) {
            zoomLevel = 1.0;
        } else {
            zoomLevel = (zoomLevel < 0.2)? 0.2: zoomLevel;
            zoomLevel = (zoomLevel > 2.0)? 2.0: zoomLevel;
        }

        const $zoomSlider = $('#zoom-slider');
        const $paperContainer = $('#paper-container');
        const $zoomLevel = $('#zoom-level');
        const $form = $('.cfe-form');
        const $page = $('.cfe-page').eq(0);
        //  スクロールバーが表示される拡大率
        // let scrollLevel = getZoomValue(4);

        // スライダーに値を設定
        $zoomSlider.val(zoomLevel * 100);
        //  ページの拡大と拡大率の書き込み
        $form.css('transform', `scale(${zoomLevel})`);
        $zoomLevel.text(`${Math.round(zoomLevel * 100)}%`);

        //  コンテナのサイズ
        const containerWidth = $paperContainer.innerWidth();
        const containerHeight = $paperContainer.innerHeight();

        // 用紙のサイズと位置を再計算
        const newPaperWidth = $page.outerWidth();
        const newPaperHeight = $page.outerHeight();

        // コンテナの中心に対する用紙の中央位置を計算
        const scrollLeft = (newPaperWidth - containerWidth) / 2;
        const scrollTop = (newPaperHeight - containerHeight) / 2;

        // スクロール位置を調整
        $paperContainer.scrollLeft(scrollLeft);
        $paperContainer.scrollTop(scrollTop);
    }

    // 拡大指示のインデックス
    cfe.ZOOM_WHOLE = 0;     //  用紙全体
    cfe.ZOOM_WIDTH = 1;     //  横幅いっぱい
    cfe.ZOOM_REAL = 2;      //  実寸（100%）

    /**
     * インデックスに従った拡大率を取得する
     * @param {number} idx  拡大指示のインデックス
     *              0: ページ全体、1:幅横幅いっぱい、2:100%
     *              4:ページ全体（マージンなし） 
     * @returns {number}  拡大率
     */
    function getZoomValue(idx) {
        const $paper = $('.cfe-page').eq(0);
        const $paperContainer = $('#paper-container');
        // 用紙とコンテナのサイズを取得
        const paperWidth = $paper.outerWidth();
        const paperHeight = $paper.outerHeight();
        const containerWidth = $paperContainer.innerWidth();
        const containerHeight = $paperContainer.innerHeight();
        // 用紙がコンテナに収まるための拡大率を計算
        const scaleX = containerWidth / paperWidth;
        const scaleY = containerHeight / paperHeight;

        let zoomValue = 1;
        if(idx==cfe.ZOOM_WHOLE) {
            zoomValue = Math.min(scaleX, scaleY) * 0.92;
        } else if(idx==cfe.ZOOM_WIDTH) {
            zoomValue = scaleX * 0.92;
        } else if(idx==4) {
            zoomValue = Math.min(scaleX, scaleY);
        }
        return zoomValue;
    }

    cfe.tools = cfe.tools || {};

    /**
     * 拡大率設定ツール
     * @type {Tool}
     */
    cfe.tools.Zoom = {
        id: 'Zoom',
        items: [ 'level', 'index', 'percent' ],
        content: `
            <div id="zoom-controls">
                <button id="zoom-out"><span class="material-icons">arrow_left</span></button>
                <div id="slider-container">
                    <button id="zoom-level">100%</button>
                    <input type="range" id="zoom-slider" min="20" max="200" value="100">
                </div>
                <button id="zoom-in"><span class="material-icons">arrow_right</span></button>
            </div>
        `,

        /**
         * 初期化
         * @function
         * @param {cfe.clsController} controller コントローラ
         */
        initialize: (controller)=>{
            const $zoomLevel = $('#zoom-level');
            const $zoomSlider = $('#zoom-slider');
        
            // スライダーの変更イベント
            $zoomSlider.on('input', function() {
                //  スライダーの値で拡大率を更新
                let zoomLevel = $zoomSlider.val() / 100;
                updateZoom(zoomLevel);
                //  コントローラに通知
                controller.onToolChange(zoomLevel, 'level', cfe.tools.Zoom.id);
            });
        
            // 拡大／縮小 ボタンのクリックイベント
            $('#zoom-in, #zoom-out').on('click', function() {
                //  in/out より刻み幅を得、拡大率を更新
                let zoomLevel = $zoomSlider.val() / 100;
                const dirc = ($(this).attr('id')).split('-')[1];
                let step = (dirc=='in')? 0.2: -0.2;
                updateZoom(zoomLevel + step);
                //  コントローラに通知
                zoomLevel = $zoomSlider.val() / 100;
                controller.onToolChange(zoomLevel, 'level', cfe.tools.Zoom.id);
            });
        
            //  拡大率表示のクリックイベント
            $zoomLevel.on('click', function() {
                //  各インデックスでの拡大率を取得しソート
                let zoomLevels = [
                    getZoomValue(0),
                    getZoomValue(1),
                    getZoomValue(2),
                ];
                zoomLevels.sort((a,b) => {
                    return a - b;
                });
                //  最初に見つかった、現在の拡大率より大きい拡大率を得る
                let curZoom = $zoomSlider.val();
                for(var i=0; i<3; i++ ) {
                    if(curZoom < Math.floor(zoomLevels[i] * 100)) {
                        break;
                    }
                }
                //  見つからなかったら、一番小さいもの。
                i = (i==3)? 0: i;
                updateZoom(zoomLevels[i]);
                //  コントローラに通知
                controller.onToolChange(zoomLevels[i], 'level', cfe.tools.Zoom.id);
            });
        },

        /**
         * UIの状態の取得
         * @function
         * @param {string} item 項目名
         * @returns {string} UIの状態の値
         */
        getStatus: ()=>{
            return $('#zoom-slider').val() / 100;
        },

        /**
         * UIに状態を設定する
         * @function
         * @param {string} value 設定する値
         * @param {string} mod 項目名 
         */
        setStatus: (value, mod)=>{
            if(mod=='index') {
                zoomLevel = getZoomValue(value);               
            } else if(mod=='percent' || mod=='%') {
                zoomLevel = value / 100;
            } else {
                zoomLevel = value;
            }
            updateZoom(zoomLevel);
        }
    };
    
})(pblForm);
