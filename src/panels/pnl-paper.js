/** 
 * panels/pnl-paper.js
 * 用紙サイズ・マージン・グリッド　設定パネル
 * @copyright   2024 Yujakudo
 */

((cfe)=>{

    /**
     * クラス：用紙サイズパネル
     */
    cfe.panel.clsPaperSize = class extends cfe.panel.clsPanel {

        constructor(controller) {
            super(controller);
            this.category = 'PaperSize';
            this.content = `
                <div class="panel-container">
                    <div class="panel-row">
                        <$ label:size $>
                        <$ input:size $>
                        <$ label:orientation $>
                        <$ input:orientation $>
                    </div>
                </div>
            `;
        }
    };

    /**
     * クラス：用紙マージンパネル
     */
    cfe.panel.clsPaperMargin = class extends cfe.panel.clsPanel {
        constructor(controller) {
            super(controller);
            this.category = 'PaperMargin';
            this.content = `
                <div class="panel-container">
                    <div class="margin-grid">
                        <div class="panel-row margin-item">
                            <$ label:top $>
                            <$ input:top $>
                        </div>
                        <div class="has-link-button">
                            <$ input:linkTopBottom $>
                        </div>
                        <div class="panel-row margin-item">
                            <$ label:bottom $>
                            <$ input:bottom $>
                        </div>
                        <div class="panel-row margin-item">
                            <$ label:left $>
                            <$ input:left $>
                        </div>
                        <div class="has-link-button">
                            <$ input:linkLeftRight $>
                        </div>
                        <div class="panel-row margin-item">
                            <$ label:right $>
                            <$ input:right $>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * クラス：グリッドパネル
     */
    cfe.panel.clsGrid = class extends cfe.panel.clsPanel {
        constructor(controller) {
            super(controller);
            this.category = 'Grid';
            this.content = `
                <div class="panel-container">
                    <div class="panel-row grid-settings-line">
                        <label>縦線：</label>
                        <div>
                            <!--  等分／一定間隔  -->
                            <$ input:verticalLines $>
                        </div>
                    </div>
                    <div class="vertical-equal-panel panel-row settings-panel">
                        <!--  分割数  -->
                        <$ label:verticalDivision $>
                        <$ input:verticalDivision $>
                    </div>
                    <div class="vertical-fixed-panel panel-row settings-panel">
                        <!--  間隔・起点  -->
                        <$ label:verticalInterval $>
                        <$ input:verticalInterval $>
                        <$ label:verticalStartPoint $>
                        <$ input:verticalStartPoint $>
                    </div>
                    <div class="panel-row grid-settings-line">
                        <label>横線：</label>
                        <div>
                            <!--  等分／一定間隔  -->
                            <$ input:horizontalLines $>
                        </div>
                    </div>
                    <div class="horizontal-equal-panel panel-row settings-panel">
                        <!--  分割数  -->
                        <$ label:horizontalDivision $>
                        <$ input:horizontalDivision $>
                    </div>
                    <div class="horizontal-fixed-panel panel-row settings-panel">
                        <!--  間隔・起点  -->
                        <$ label:horizontalInterval $>
                        <$ input:horizontalInterval $>
                        <$ label:horizontalStartPoint $>
                        <$ input:horizontalStartPoint $>
                    </div>

                    <div class="header-footer-settings">
                        <div class="panel-row">
                            <!--  ヘッダ  -->
                            <$ input:headerVisible $>
                            <div class="header-footer-panel settings-panel">
                                <!--  位置・高さ  -->
                                <div class="panel-row">
                                    <$ label:headerPosition $>
                                    <$ input:headerPosition $>
                                </div>
                                <div class="panel-row">
                                    <$ label:headerHeight $>
                                    <$ input:headerHeight $>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="header-footer-settings">
                        <div class="panel-row">
                            <!--  フッタ  -->
                            <$ input:footerVisible $>
                            <div class="header-footer-panel settings-panel">
                                <!--  位置・高さ  -->
                                <div class="panel-row">
                                    <$ label:footerPosition $>
                                    <$ input:footerPosition $>
                                </div>
                                <div class="panel-row">
                                    <$ label:footerHeight $>
                                    <$ input:footerHeight $>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * 変更があったときに呼ばれる処理
         * @param {any} value 値
         * @param {string} category カテゴリ
         * @param {string} item 項目
         */
        onChange(value, category, item) {
            this.onSetStaus(value, item);
        }

        /**
         * 値がセットされたときに呼ばれる処理
         * 縦線・横線各々、間隔の種類に従って設定パネルを切り替える
         * @param {any} value 値
         * @param {string} item 項目
         */
        onSetStaus(value, item) {
            if(item === 'verticalLines' || item === 'horizontalLines') {
                const lineType = item.slice(0, -5);
                const isEqual = (value === 'equal');
                this.$container.find(`.${lineType}-equal-panel`)
                        .toggle(isEqual);
                this.$container.find(`.${lineType}-fixed-panel`)
                        .toggle(!isEqual);
            }
        }
    }

})(pblForm);
