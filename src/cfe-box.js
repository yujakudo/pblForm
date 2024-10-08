/**
 * cfe-box.js
 * ボックス
 * @copyright   2024 Yujakudo
 */

((cfe)=>{

    /**
     * ボックスの辺・角の名前
     */
    cfe.BOX_PARTS = [
        'top',
        'bottom',
        'left',
        'right',
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right'
    ];

    /**
     * 渡された名前が、ボックスの辺あるいは角の名前か調べる
     * @param {string} name 文字列
     * @returns {integer} 0:辺・角の名前ではない。　1:辺。　2:角。
     */
    cfe.isBoxPart = function(name) {
        let idx = cfe.BOX_PARTS.indexOf(name);
        return (idx<0)? 0: (idx<4)? 1: 2;
    }

    /**
     * ボックス
     * フォーム上に配置するボックス（枠）を管理するクラス。
     * @classdesc
     * @property {string} id ID
     * @property {Object} settings 設定
     * @property {Object} $box jQueryオブジェクト
     */
    cfe.clsBox = class {

        id;
        settings;
        $box;

        /**
         * コンストラクタ
         * @param {Object} $box 接続するボックスのjQueryオブジェクト。未指定可。
         */
        constructor($box) {
            this.settings = undefined;
            this.id = undefined;
            this.$box = $box;
            if(undefined!==$box) {
                this.attachBox($box);
            }
        }

        /**
         * インスタンスを終了する
         */
        close() {
            this.detachBox();
        }

        /**
         * ボックスを生成する
         * @param {Object} $container コンテナのjQueryオブジェクト. 
         */
        create($container, id) {
            this.id = id;
            this.settings = {};
            this.$box = $container.append(
                `<div id="${id}" data-settings="{}"></div>`
            );
        }

        /**
         * ボックスの削除。
         * HTML上も削除する。
         */
        remove() {
            if(this.$box) {
                this.$box.remove();
            }
            this.detachBox();
        }

        /**
         * HTML上のボックスと結びつける
         * @param {Object} $box DOM要素のjQueryオブジェクト
         */
        attachBox($box) {
            this.$box = $box;
            this.id = this.$box.attr('id');
            const json = this.$box.attr('data-settings');
            this.settings = {};
            if(!json) {
                this.$box.attr('data-settings', '{}');
            } else {
                try {
                    this.settings = JSON.parse(json);
                } catch(e) {
                }
            }
        }

        /**
         * HTML上のボックスの切り離し
         */
        detachBox() {
            this.$box = undefined;
            this.settings = undefined;
            this.id = undefined;
        }

        /**
         * 設定値の取得
         * @param {string} category カテゴリ。
         *      未指定の場合はすべての設定をオブジェクトで返す。
         * @param {string} item 項目名。
         *      未指定の場合はカテゴリ内の全ての項目の設定をオブジェクトで返す。
         * @returns {any} 設定されている値。またはそのオブジェクト
         */
        getSetting(category, item) {
            //  カテゴリが未指定なら、設定をそのまま返す。
            if(undefined===category) return this.settings;
            //  指定されたカテゴリが設定になければ、undefined を返す。
            if(!(category in this.settings)) return undefined;
            //  項目名が未指定なら、カテゴリ内の項目全てを返す。
            if(undefined===item) return this.settings[category];
            //  指定された項目名がカテゴリ内になければ、undefined を返す。
            if(!(item in this.settings[category])) return undefined;
            //  指定のカテゴリ.項目名の値を返す。
            return this.settings[category][item];
        }

        /**
         * 辺または角の設定値をまとめて取得する
         * @param {string[]|string} parts　辺または角の名前の配列 
         * @param {string} item 　項目名
         * @returns {any[]} 各パーツの項目値の配列
         */
        getLineSetting(parts, item) {
            if(!Array.isArray(parts)) {
                parts = [ parts ];
            }
            let values = [];
            for(const part of parts) {
                values.push(this.settings[part][item]);
            }
            return values;
        }

        /**
         * 設定する。
         * @param {any} value 設定値。
         * @param {string} category カテゴリ。
         *      未指定の場合は、valueをオブジェクトとして設定に上書き設定。
         * @param {string} item 項目名。
         *      未指定の場合は、valueをオブジェクトとしてカテゴリに上書き設定。
         */
        setSettings(value, category, item) {
            //  valuesに、category.item の構造に組み上げる 
            let values = value;
            if(undefined!==item) {
                values = {};
                values[item] = value;
            }
            if(undefined!==category) {
                let tmpVal = values;
                values = {};
                values[category] = tmpVal;
            }
            //  スタイルと表示テキストに反映
            this.#reflectStyle(values);
            this.#reflectText(values);
            //  設定を更新
            this.settings = Object.assign(this.settings, values);
            let json = JSON.stringify(this.settings)
            this.$box.attr('data-settings', json);
        }

        /**
         * 
         * @param {Object} settings 更新する設定値
         */
        #reflectText(settings) {
            if('TextAlignment' in settings
                && 'shrinkToFit' in settings.TextAlignment) {

                this.#shrinkToFit(settings.TextAlignment.shrinkToFit);
            }
            if('Text' in settings) {
                //  todo
            }
        }

        /**
         * 設定をスタイルに反映させる
         * @param {Object} settings 更新する設定値
         *      未指定の場合は、現在の設定すべてをスタイルに反映しなおす。 
         */
        #reflectStyle(settings) {
            if(undefined===settings) {
                //  settingsが未指定であったら、現在の設定をスタイル設定しなおす。
                settings = this.settings;
                this.$box.removeAttr('style');
            }
            const styles = this.#SettingsToStyle(settings);
            Object.keys(styles).forEach((attr)=>{
                const value = styles[attr];
                if(undefined!==value && value!=='') {
                    //  値があって、現在値と違ったらスタイルを設定
                    let cur = this.$box.css(attr);
                    if(styles[attr]!==cur) {
                        this.$box.css(attr, value);
                    }
                } else {
                    //  値がなかったらスタイルを削除
                    this.$box.css(attr, '');
                }
            });
        }


        /**
         * 設定をスタイルに変換する
         * @param {Object} settings 
         */
        #SettingsToStyle(settings) {
            var styles = {};
            Object.keys(settings).forEach((category)=>{
                if(cfe.isBoxPart(category)) {
                    let part = category.substring(5);
                    Object.keys(settings[category]).forEach((item)=>{
                        this.#getLineStyle(
                            settings[category][item], part, item, styles
                        );
                    });
                } else {
                    //  サブカテゴリがLine以外のとき
                    Object.keys(settings[category]).forEach((item)=>{
                        this.#getCategoryStyle(
                            settings[category][item], category, item, styles
                        );
                    });
                }
            });
        }

        /**
         * フォントに関するスタイルを取得
         * @param {string} value 値 
         * @param {string} category 項目名
         * @param {string} item 項目名 
         * @param {Object} obj スタイル属性と値をセットするオブジェクト
         */
        #getCategoryStyle(value, category, item, obj) {
            const tmplts = {
                Font: {
                    bold: { attr: 'font-weight', transform: (value) => value? 'bold': '' },
                    italic: { attr: 'font-style', transform: (value) => value? 'italic': ''},
                    fontSize: { attr: 'font-style'},
                    fontColor: { attr: 'font-style'},
                    underline: { attr: 'text-decoration',
                        transform: (value) =>
                            (undefined!==value && value!=='' && value!=='none')?
                            'underline ' + value: value
                    },
                    underlineColor: { attr: 'text-decoration-color' }
                },
                TextAlignment: {
                    vertical: { attr: 'vertical-align'},
                    horizontal: {attr: 'text-align'},
                    paddingTop: {attr: 'padding-top'},
                    paddingBottom: {attr: 'padding-bottom'},
                    paddingLeft: {attr: 'padding-left'},
                    verticalWriting: {attr: 'writing-mode', transform: 
                        (value) => (value? 'vertical-rl': '')},
                }
            };
            if(!(category in tmplts)) return;
            if(!(item in tmplts[category])) return;
            //  テンプレートの選択
            const tmplt = tmplts[category][item];

            let setValue = value;
            if('transform' in tmplt) {
                setValue = tmplt.transform(value);
            }
            setValue = cfe.addUnit(setValue, this.category, item);
            obj[tmplt.attr] = setValue;
        }

        /**
         * 枠線に関するスタイルを取得
         * @param {string} value 値 
         * @param {string} part 辺または角の名前
         * @param {string} item 項目名 
         * @param {Object} obj スタイル属性と値をセットするオブジェクト
         */
        #getLineStyle(value, part, item, obj) {
            //  設定するスタイル属性
            let attr = {
                lineType: 'style',
                lineWidth: 'width',
                lineColor: 'color',
                borderRadius: 'radius'
            }[item];
            //  角のときは必ずattrは'radius'。辺のときはそれ以外なので
            //  場合分けはしない
            attr = `border-${part}-${attr}`;
            //  オブジェクトにセットする
            obj[attr] = cfe.addUnit(value, this.category, item);
        }

        /**
         * 現在のスタイルをオブジェクトで取得する
         * @returns {Object} スタイルのオブジェクト
         */
        getCurrentStyle() {
            const arrStyle = this.$box.attr('style').split(';');
            let styles ={};
            for(let a_style of arrStyle) {
                a_style = a_style.split(':');
                styles[a_style[0].trim()] = a_style[1].trim();
            }
            return styles;
        }

        /**
         * テキストがボックスに収まるようにフォントを小さくする
         * @param {boolean} value 調整するか？ 
         */
        #shrinkToFit(value) {
            //  設定上のフォントサイズに戻す。
            let settingSize = this.getSetting('Font', 'size');
            if(undefined===settingSize) {
                this.$box.css('font-size', '');
                settingSize = this.$box.css('font-size');
            }
            //  テキストがオーバーフローするか？
            function isOverflow(size) {
                this.$box.css('font-size', size);
                let contentH = this.$box.height();
                let textH = this.$box.get(0).scrollHeight();
                return (textH > contentH);
            }
            //  設定上のフォントでテキストがおさまっていれば終了
            if(!isOverflow(settingSize)) return;
            //  調整しないなら終了（isOverflow内部でフォントサイズは設定）
            if(!value) return;
            //  設定値を、数値と単位に分ける
            matches = settingSize.match(/([\d\.]+)(\w*)/);
            if(!matches) return;
            let size =  parseFloat(matches[1]);
            const unit =  matches[2];
            //  フォントサイズの下限値でなおオーバーフローするなら終了
            let upper = size;
            let lower = 4;
            if(isOverflow(lower + unit)) return;
            if(upper < lower) return;
            //  上限と下限の差がが0.5より大きい間
            while(upper - lower > 0.5) {
                let test = parseInt(upper - lower) / 2;
                if(test==upper || test==lower) break;
                if(isOverflow(test + unit)) {
                    upper = test;
                } else {
                    lower = test;
                }
            }
            this.$box.css('font-size', lower + unit);
        }

    }
})(pblForm);
