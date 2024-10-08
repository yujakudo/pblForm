

((cfe)=>{
    //  パネルの名前空間
    cfe.panel = {};

    /**
     * クラス：パネル
     * 全てのパネルの基底クラス
     * @property {string} category カテゴリ名
     * @property {strict} content パネルのHTML。
     *      形式タグ <$ [operation]:[name] [attributes] $> は展開される。
     * @property {cfe.clsController} controller コントローラのオブジェクト
     * @property {jQuery} $container コンテナのjQueryオブジェクト
     * @property {Object} links リンク情報。
     *          リンクボタンがあり、値を同じにする項目があるときに用いる。
     *          項目名をキーに検索すると、リンクボタンの項目名がヒットする。
     */
    cfe.panel.clsPanel = class {
        static category;
        static content;
        controller;
        $container;
        links;

        /**
         * コンストラクタ
         * @param {cfe.cldController} controller コントローラ 
         */
        constructor(controller) {
            this.controller = controller;
            this.linkDic = {};
        }

        /**
         * 設定のためのHTMLを取得する
         * '<$ operand:item attrs $>'の形式タグを、設定情報を下に適切に変換して
         * HTMLを生成し、返す。
         * @returns {string} HTML
         */
        getContent() {
            return this.content.replaceAll(
                /<\$\s*(\w+):(\w+)(\s+[^\s]+)?\s*\$>/g, (match, ope, arg, attrs, offset, string) => {
                
                switch(ope) {
                    case 'label':
                        const itemInfo = cfe.SETTING_ITEMS[this.category].items[arg];
                        return `<label>${itemInfo.label} :</label>`;

                    case 'input':
                        return this.#makeInput(arg, attrs);
                }
            });
        };

        /**
         * 項目に対応するタグのjQueryオブジェクトを取得する
         * @param {string|string[]} types 入力型
         *   （select, text, number, color, radio, checkbox, link-button）
         * @returns {jQuery} jQueryオブジェクト
         */
        $input(types) {
            if(! Array.isArray(types)) {
                types = [types];
            }
            const selector = types.map((type)=>{
                if(type === 'select') {
                    return `select[data-category="${this.category}"]`;
                } else if(type === 'checkbox') {
                    return `input[type="${type}"][data-category="${this.category}"]:not(.link-button)`
                } else if(type === 'link-button') {
                    return `input.link-button[data-category="${this.category}"]`
                } else {
                    return `input[type="${type}"][data-category="${this.category}"]`
                }
            }).join(', ');
            return this.$container.find(selector);
        }

        /**
         * イベントハンドラの登録
         * @param {jQuery} $container コンテナのjQueryオブジェクト 
         */
        bind($container) {
            this.$container = $container;
            var this_panel = this;
            //  イベントハンドラの登録
            this.$input('checkbox').on('click', function() {
                this_panel.onEvent($(this), 'checkbox');
            });
            this.$input('link-button').on('click', function() {
                this_panel.onEvent($(this), 'link-button');
            });
            this.$input(['select', 'text', 'number', 'color', 'radio']).on('change', function() {
                this_panel.onEvent($(this));
            });
        };

        /**
         * イベント処理
         * 各コントロールのイベントハンドラより呼ばれる。
         * カテゴリ、項目名、値を取得し、コントローラに通知する。
         * @param {jQuery} $input イベントの起きた jQuery オブジェクト
         * @param {string} type コントロールの型。 
         */
        onEvent($input, type) {
            //  カテゴリ、項目名、値の取得
            const category = $input.attr('data-category');
            var item = $input.attr('data-item');
            var value = this.getStatus(item);
            if(type==='link-button') {
                value = this.#onLinkClick(value, category, item);
            } else if(item in this.linkDic) {
                value = this.#changeLinkedItems(value, category, item);
            }
            //  パネルに onChange メソッドがあればコールする。
            if(this.onChange) {
                let newValue = this.onChange(value, category, item);
                //  値が帰ってきたら、それを新しい値にする。
                if(undefined!==newValue) {
                    //  null ならなかったことにする。
                    if(newValue===null) return;
                    //  新しい値にする。
                    value = newValue;
                }
            }
            if(typeof value==='object') item = undefined;
            this.controller.onPanelChange(value, category, item);
        }

        /**
         * リンクボタンが押されたときの処理
         * onEventより、表題のときに呼ばれる。
         * @param {any} value 値 
         * @param {string} category カテゴリ 
         * @param {string} item 項目名
         * @returns {Object|undefined} 新しい値のセット
         */
        #onLinkClick(value, category, item) {
            //  リンク状態でないなら、何もしない。
            if(!value) return value;
            //  項目の情報
            const itemInfo = cfe.SETTING_ITEMS[category].items[item];
            //  項目リストの先頭の項目の値に変える
            const genItem = itemInfo.with[0];
            const linkedValue = this.getStatus(genItem);
            //  リンク先に反映させる。変更があれば、新しい値を返す。
            let newValues = this.getLinkedValues(linkedValue, genItem, item, category);
            if(newValues) {
                //  新しい値のセットがあれば、リンクボタン自身の変更を格納して返す。
                newValues[item] = value;
                return newValues
            }
            return value;
        }

        /**
         * リンクされている項目が変更されたときの処理
         * onEventより、表題のときに呼ばれる。
         * リンク状態であれば、連動するコントロールの値も変更する。
         * @param {any} value 値 
         * @param {string} category カテゴリ 
         * @param {string} item 項目名
         * @returns {Object|undefined} 新しい値のセット
         */
        #changeLinkedItems(value, category, item) {
            //  リンクボタンとその状態を取得
            const linkButton = this.linkDic[item];
            const isLinking = this.getStatus(linkButton);
            //  リンクしていなければ終了
            if(! isLinking) return value;
            //  リンク先に反映させる。変更があれば、新しい値を返す。
            let newValues = this.#getLinkedValues(value, item, linkButton, category);
            if(newValues) {
                //  新しい値のセットがあれば、自身の変更を格納し、それを返す。
                newValues[item] = value;
                return newValues
            }
            return value;
        }

        /**
         * リンクされている項目の値を変更し、新しい値のセットを得る。
         * @param {any} value リンク先に反映させる値 
         * @param {string} genItem 下の項目名
         * @param {string} linkButton リンクボタンの項目名
         * @param {string} category カテゴリ
         * @returns {Object|undefined} newValues 新しい値のセット。元の値は呼び出し側でセットすること。
         */
        #getLinkedValues(value, genItem, linkButton, category) {
            var changed = false;
            var newValues = {};
            //  リンクボタンの情報内のリストで、リンクされている項目についてループ
            const linkInfo = cfe.SETTING_ITEMS[category].items[linkButton];
            for(const linkedItem of linkInfo.with) {
                if(linkedItem===genItem) continue;
                //  変更された項目以外について
                let oldValue = this.getStatus(linkedItem);
                if(oldValue != value) {
                    //  値が異なるなら、変更する。
                    this.setStatus(value, linkedItem);
                    newValues[linkedItem] = value;
                    changed = true;
                }
            }
            return changed? newValues: undefined;
        }

        /**
         * 設定情報に従って入力コントロールのタグを生成する
         * @param {string} item 項目名
         * @param {string} attrs 属性の文字列
         * @returns {string} タグのHTML
         */
        #makeInput(item, attrs) {
            //  設定情報より、属性として参照するもののリスト
            const refAttrs = {
                text: [],
                color: ['list'],
                number: ['max', 'min', 'step'],
            }
            //  項目の情報
            const itemInfo = cfe.SETTING_ITEMS[this.category].items[item];
            var tag;
            if(undefined===attrs) attrs = '';
            attrs = `data-category="${this.category}" data-item="${item}" ` + attrs.trim();
            switch(itemInfo.control) {
                case 'select':
                    let options;
                    if(Array.isArray(itemInfo.options)) {
                        options = itemInfo.options.map(
                            (opt)=>`<option value="${opt}">${opt}</option>`
                        ).join('');
                    } else {
                        options = Object.entries(itemInfo.options).map(
                            ([key, value]) => `<option value="${key}">${value}</option>`
                        ).join('');
                    }
                    tag = `<select ${attrs}>${options}</select>`;
                    break;

                case 'radio':
                    tag = Object.entries(itemInfo.options).map(
                        ([key, value]) => `<label><input type="radio" name="${item}" value="${key}" ${attrs} /> ${value}</label>`
                    ).join('');
                    break;
                
                case 'link-button':
                    //  クラスに "link-button" を追加
                    let matches = attrs.match(/class=\"([^\"]*)\"/);
                    if(matches) {
                        attrs.replace(/class=\"([^\"]*)\"/, (matches, classes)=> { 
                                return `class="${classes} button"`;
                        });
                    } else {
                        attrs += ' class="link-button"';
                    }
                    //  リンク辞書に登録
                    for(let ref of itemInfo.with) {
                        this.linkDic[ref] = item;
                    }
                    tag = `<input type="checkbox" ${attrs} />`
                    break;

                case 'checkbox':
                    tag = `<label><input type="checkbox" ${attrs} />${itemInfo.label}</label>`
                    break;

                case 'text':
                case 'number':
                case 'color':
                    for(let ref of refAttrs[itemInfo.control]) {
                        attrs += (ref in itemInfo)? ` ${ref}="${itemInfo[ref]}"`: '';
                    }
                    tag = `<input type="${itemInfo.control}" ${attrs} />`;
                    break;
                default:
                    tag = `<p>項目 ${item} の、input: ${itemInfo.control}は不正です。</p>`;
                    break;
            }
            let unit = '';
            if('unit' in itemInfo) {
                unit = `<span class="unit">${itemInfo.unit}</span>`;
            }
            return '<span>' + tag + '</span>' + unit;
        };

        /**
         * 項目に対応するタグのjQueryオブジェクトを取得する
         * @param {string} item 項目名 
         * @param {string} opt セレクタに追加する文字列 
         * @returns {jQuery} jQueryオブジェクト
         */
        $item(item, opt) {
            if(undefined===opt) opt ='';
            return this.$container.find(`[data-item="${item}"]${opt}`);
        }

        /**
         * UIの状態の取得
         * @param {string} item 項目名
         * @returns {string} UIの状態の値
         */
        getStatus(item) {
            
            //  項目の情報
            const itemInfo = cfe.SETTING_ITEMS[this.category].items[item];
            var value;
            //  コントロールの種類に従って、値を取得
            switch(itemInfo.control) {
                case 'radio':
                    value = this.$item(item, ':checked').val();
                    break;
                case 'link-button':
                case 'checkbox':
                    value = this.$item(item).prop('checked');
                    break;
                default:
                    value = this.$item(item).val();
                    break;
            }
            //  型に従って、値を変換
            switch(itemInfo.type) {
                case 'integer':
                    value = parseInt(value);
                    break;
                case 'float':
                    value = parseFloat(value);
                    break;
            }
            return value;
        };

        /**
         * UIに状態を設定する
         * @function
         * @param {string} value 設定する値
         * @param {string} item 項目名 
         */
        setStatus(value, item) {
            //  項目の情報
            const itemInfo = cfe.SETTING_ITEMS[this.category].items[item];
            //  コントロールの種類に従って、コントロールに値を設定
            switch(itemInfo.control) {
                case 'radio':
                    this.$item(item, `[value="${value}"]`).prop('checked', true);
                    break;
                case 'link-button':
                case 'checkbox':
                    this.$item(item).prop('checked', value);
                    break;
                case 'select':
                    if(undefined===value || value==='') {
                        //  undefindまたは空文字列のときは、未選択にする
                        this.$item(item).prop('selected', false);
                    }　else {
                        this.$item(item).val(value);
                    }
                    break;
                default:
                    this.$item(item).val(value);
                    break;
            }
            //  パネルに onSetStaus メソッドがあればコールする。
            if(this.onSetStaus) {
                let newValue = this.onSetStaus(value, item);
            }

        }
    };

})(pblForm);