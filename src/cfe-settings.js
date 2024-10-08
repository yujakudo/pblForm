/**
 * cfe-settings.js
 * 設定項目の定義
 * @copyright   2024 Yujakudo
 */

((cfe)=>{

    /**
     * デフォルトのエディタ設定値
     */
    cfe.SETTING_ITEMS = {
        Form: {
            label: '帳票',
            items: {
                'id': {
                    label: 'ID', type: 'string', default: '', control: 'text'
                },
                'name': {
                    label: '名前', type: 'string', default: '未定義', control: 'text'
                }
            }
        },
        PaperSize: {
            label: '用紙のサイズと向き',
            items: {
                'size': {
                    label: 'サイズ', type: 'string', default: 'A4', control: 'select',
                    options: ['A5', 'B5', 'A4', 'B4', 'A3'],
                    tooltip: '用紙のサイズを選択します。',
                },
                'orientation':  {
                    label: '向き', type: 'string', default: 'portrait', control: 'select',
                    options: {portrait: '縦置き', landscape: '横置き'},
                    tooltip: '用紙の向きを、縦置きにするか、あるいは横置きにするかを選択します。',
                },
            }
        },
        PaperMargin: {
            label: '余白',
            items: {
                'top': {
                    label: '上', type: 'integer', default: 15, unit: 'mm',
                    control: 'number', max: 50, min: 0, step: 1,
                    tooltip: '用紙の上側の余白の、高さを設定します。',
                 },
                'bottom': {
                    label: '下', type: 'integer', default: 15, unit: 'mm',
                    control: 'number', max: 50, min: 0, step: 1,
                    tooltip: '用紙の下側の余白の、高さを設定します。',
                 },
                 'left': {
                    label: '左', type: 'integer', default: 12, unit: 'mm',
                    control: 'number', max: 50, min: 0, step: 1,
                    tooltip: '用紙の左側の余白の、幅を設定します。',
                 },
                 'right': {
                    label: '右', type: 'integer', default: 12, unit: 'mm',
                    control: 'number', max: 50, min: 0, step: 1,
                    tooltip: '用紙の右側の余白の、幅を設定します。',
                 },
                 'linkTopBottom': {
                    label: '上下リンク', type: 'boolean', default: true,
                    control: 'link-button', with: ['top', 'bottom'],
                    tooltip: '上と下の余白の高さを同じにします。',
                 },
                 'linkLeftRight': {
                    label: '左右リンク', type: 'boolean', default: true,
                    control: 'link-button', with: ['left', 'right'],
                    tooltip: '左と右の余白の幅を同じにします。',
                 },
            }
        },
        Grid: {
            label: 'グリッド',
            items: {
                'verticalLines': {
                    label: '縦線', type: 'string', default: 'equal',
                    control: 'radio',
                    options: {equal: '等分', fixed: '一定間隔'},
                    tooltip: 'グリッドの縦線について、表示領域を等分に分割するように引くか、'
                            + 'あるいは一定間隔で引くかを選択します。',
                },
                'horizontalLines': {
                    label: '横線', type: 'string', default: 'fixed',
                    control: 'radio',
                    options: {equal: '等分', fixed: '一定間隔'},
                    tooltip: 'グリッドの横線について、表示領域を等分に分割するように引くか、'
                            + 'あるいは一定間隔で引くかを選択します。',
                },
                'verticalDivision': {
                    label: '分割数', type: 'integer', default: 24,
                    control: 'select', options: [/* プログラムで作成 */], 
                    tooltip: '縦線で、表示領域を何等分に分割するかを設定します。',
                },
                'verticalInterval': {
                    label: '間隔', type: 'float', default: 20, unit: 'pt',
                    control: 'number', max: 400, min: 4, step: 0.5,
                    tooltip: '縦線の間隔を設定します。',
                },
                'verticalStartPoint': {
                    label: '起点', type: 'string', default: 'left',
                    control: 'select', options: {left: '左', center: '中', right: '右'}, 
                    tooltip: '左端、右端、あるいは中心の、どこに縦線が必ず来るようにするかを選択します。',
                },
                'horizontalDivision': {
                    label: '分割数', type: 'integer', default: 24,
                    control: 'select', options: [/* プログラムで作成 */], 
                    tooltip: '横線で、表示領域を何等分に分割するかを設定します。',
                },
                'horizontalInterval': {
                    label: '間隔', type: 'float', default: 20, unit: 'pt',
                    control: 'number', max: 400, min: 4, step: 0.5,
                    tooltip: '横線の間隔を設定します。',
                },
                'horizontalStartPoint': {
                    label: '起点', type: 'string', default: 'top',
                    control: 'select', options: {top: '上', center: '中', bottom: '下'}, 
                    tooltip: '上端、下端、あるいは中心の、どこに横線が必ず来るようにするかを選択します。',
                },
                'headerVisible': {
                    label: 'ヘッダ', type: 'boolean', default: true, control: 'checkbox',
                    tooltip: 'ヘッダ領域のグリッドを表示する場合はチェックします。',
                },
                'headerPosition': {
                    label: '上端より', type: 'integer', default: 4, unit: 'mm',
                    control: 'number', max: 20, min: 0, step: 1,
                    tooltip: 'ヘッダ領域の位置を、上端からどれだけ離すかを設定します。',
                },
                'headerHeight': {
                    label: '高さ', type: 'float', default: 16, unit: 'pt',
                    control: 'number', max: 40, min: 4, step: 0.5,
                    tooltip: 'ヘッダ領域の高さを設定します。',
                },
                'footerVisible': {
                    label: 'フッタ', type: 'boolean', default: true, control: 'checkbox',
                    tooltip: 'フッタ領域のグリッドを表示する場合はチェックします。',
                },
                'footerPosition': {
                    label: '下端より', type: 'integer', default: 4, unit: 'mm',
                    control: 'number', max: 20, min: 0, step: 1,
                    tooltip: 'フッタ領域の位置を、下端からどれだけ離すかを設定します。',
                },
                'footerHeight': {
                    label: '高さ', type: 'float', default: 16, unit: 'pt',
                    control: 'number', max: 40, min: 4, step: 0.5,
                    tooltip: 'フッタ領域の高さを設定します。',
                },
            }
        },
        Font: {
            label: 'フォント',
            items: {
                'fontName': {
                    label: 'フォント名', type: 'float', default: 'ms-pgothic',
                    control: 'select', options: cfe.FONTS,
                    tooltip: 'フォントを選択します。',
                },
                'bold': {
                    label: '太字', type: 'boolean', default: false,
                    control: 'checkbox',
                    tooltip: '太字にする場合はチェックします。',
                },
                'italic': {
                    label: '斜体', type: 'boolean', default: false,
                    control: 'checkbox',
                    tooltip: '斜体にする場合はチェックします。',
                },
                'fontSize': {
                    label: 'サイズ', type: 'float', default: 12, unit: 'pt',
                    control: 'number', max: 200, min: 4, step: 0.5,
                    tooltip: 'フォントのサイズを指定します。',
                },
                'fontColor': {
                    label: '色', type: 'color', default: '#000000',
                    control: 'color', list: 'default-colors',
                    tooltip: '文字の色を指定します。',
                },
                'underline': {
                    label: '下線', type: 'string', default: 'none',
                    control: 'select', options: {
                        none: 'なし', solid: '実線', double: '二重線',
                        dotted: '点線', dashed: '破線', wavy: '波線'
                    },
                    tooltip: '下線を引く場合は、その種類を選択します。',
                },
                'underlineColor': {
                    label: '下線の色', type: 'color', default: '#000000',
                    control: 'color', list: 'default-colors',
                    tooltip: '下線を引く場合は、その色を選択します。',
                },
            }
        },
        Line: {
            label: '枠線',
            items: {
                'lineType': {
                    label: '線種', type: 'string', default: 'solid',
                    control: 'select', options: {
                        none: 'なし', solid: '実線', double: '二重線',
                        dotted: '点線', dashed: '破線'
                    },
                    tooltip: '線の種類を選択します。',
                },
                'lineWidth': {
                    label: '太さ', type: 'float', default: 1, unit: 'px',
                    control: 'number', max: 10, min: 0, step: 0.25,
                    tooltip: '線の太さを指定します。',
                },
                'lineColor': {
                    label: '色', type: 'color', default: '#000000',
                    control: 'color', list: 'default-colors',
                    tooltip: '線の色を指定します。',
                },
                'borderRadius': {
                    label: '角丸', type: 'integer', default: 0, unit: 'mm',
                    control: 'number', min: 0, max: 50, step: 1, 
                    tooltip: '角の半径を指定します。',
                },
            }
        },
        // テキストの配置
        TextAlignment: {
            label: '書式',
            items: {
                vertical: {
                    label: '縦', type: 'string', default: 'middle', control: 'select', 
                    options: {
                        top: '上詰め', middle: '中央揃え',
                        bottom: '下詰め', justify: '均等'
                    },
                    tooltip: '縦方向での配置の仕方を指定します。',
                },
                horizontal: {
                    label: '横', type: 'string', default: 'center', control: 'select',
                    options: {
                        left: '左詰め', center: '中央揃え',
                        right: '右詰め', justify: '均等'
                    },
                    tooltip: '横方向での配置の仕方を指定します。',
                },
                paddingTop: {
                    label: '上', type: 'integer', default: 2, unit: 'mm',
                    control: 'number', min: 0, max: 50, step: 1, 
                    tooltip: 'ボックス内の上の余白を指定します。',
                },
                paddingBottom: {
                    label: '下', type: 'integer', default: 2, unit: 'mm',
                    control: 'number', min: 0, max: 50, step: 1,
                    tooltip: 'ボックス内の下の余白を指定します。'
                },
                paddingLeft: {
                    label: '左', type: 'integer', default: 2, unit: 'mm',
                    control: 'number', min: 0, max: 50, step: 1,
                    tooltip: 'ボックス内の左の余白を指定します。'
                },
                paddingRight: {
                    label: '右', type: 'integer', default: 2, unit: 'mm',
                    control: 'number', min: 0, max: 50, step: 1,
                    tooltip: 'ボックス内の右の余白を指定します。'
                },
                paddingLinkTopBottom: {
                    label: '上下リンク', type: 'boolean', default: true,
                    control: 'link-button', with: ['paddingTop', 'paddingBottom'],
                    tooltip: '上と下の余白を同じにします。',
                 },
                 paddingLinkLeftRight: {
                    label: '左右リンク', type: 'boolean', default: true,
                    control: 'link-button', with: ['paddingLeft', 'paddingRight'],
                    tooltip: '左と右の余白を同じにします。',
                 },
                shrinkToFit: {
                    label: '縮小して全体を表示', type: 'boolean', default: false,
                    control: 'checkbox',
                    tooltip: 'フォントを小さくして、全体が表示されるようにする場合はチェックします。',
                },
                verticalWriting: {
                    label: '縦書き', type: 'boolean', default: false,
                    control: 'checkbox',
                    tooltip: '縦書きにする場合はチェックします。',
                },
            },
        },
        //  角丸
        BorderRadius: {
            label: '角丸',
            items: {
                topLeft: {
                    label: '左上', type: 'integer', default: 0, unit: 'mm',
                    control: 'number', min: 0, max: 50, step: 1, 
                    tooltip: '左上の角の半径を指定します。',
                },
                topRight: {
                    label: '右上', type: 'integer', default: 0, unit: 'mm',
                    control: 'number', min: 0, max: 50, step: 1, 
                    tooltip: '右上の角の半径を指定します。',
                },
                bottomLeft: {
                    label: '左下', type: 'integer', default: 0, unit: 'mm',
                    control: 'number', min: 0, max: 50, step: 1, 
                    tooltip: '左下の角の半径を指定します。',
                },
                bottomRight: {
                    label: '右下', type: 'integer', default: 0, unit: 'mm',
                    control: 'number', min: 0, max: 50, step: 1, 
                    tooltip: '右下の角の半径を指定します。',
                },
                borderRadiusLink: {
                    label: '角丸リンク', type: 'boolean', default: true,
                    control: 'link-button',
                    with: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
                    tooltip: '全ての角の半径を同じにします。',
                 },
            }
        },
        // ボックスパネル
        Box: {
            label: 'ボックス',
            // items: {
            //     cornerTopLeft: {
            //         label: '', type: 'boolean', default: false,
            //         control: 'checkbox', tooltip: '左上の角を選択します。'
            //     },
            //     edgeTop: {
            //         label: '', type: 'boolean', default: false,
            //         control: 'checkbox', tooltip: '上辺を選択します。'
            //     },
            //     cornerTopRight: {
            //         label: '', type: 'boolean', default: false,
            //         control: 'checkbox', tooltip: '右上の角を選択します。'
            //     },
            //     edgeLeft: {
            //         label: '', type: 'boolean', default: false,
            //         control: 'checkbox', tooltip: '左辺を選択します。'
            //     },
            //     edgeRight: {
            //         label: '', type: 'boolean', default: false,
            //         control: 'checkbox', tooltip: '右辺を選択します。'
            //     },
            //     cornerBottomLeft: {
            //         label: '', type: 'boolean', default: false,
            //         control: 'checkbox', tooltip: '左下の角を選択します。'
            //     },
            //     edgeBottom: {
            //         label: '', type: 'boolean', default: false,
            //         control: 'checkbox', tooltip: '下辺を選択します。'
            //     },
            //     cornerBottomRight: {
            //         label: '', type: 'boolean', default: false,
            //         control: 'checkbox', tooltip: '右下の角を選択します。'
            //     },
            // },
            subCategories: ['Line', 'Font', 'TextAlignment'],
        },
    };

    // デフォルトのエディタ設定値 cfe.SETTING_ITEMS を完成させる
    //  グリッドの分割数
    const DivisionOptions = Array.from(
        { length: 108 }, (_, i) => i + 1
    ).filter(n => {
        while (n % 2 === 0) n /= 2;
        while (n % 3 === 0) n /= 3;
        while (n % 5 === 0) n /= 5;
        return n === 1;
    });
    cfe.SETTING_ITEMS.Grid.items.verticalDivision.options = DivisionOptions;
    cfe.SETTING_ITEMS.Grid.items.horizontalDivision.options = DivisionOptions;
    

    /**
     * デフォルトの設定を得る
     * @function
     * @returns {Object} デフォルトの設定
     */
    cfe.getDefaultSettings = function() {
        let settings = {};
        //  カテゴリごとループ
        Object.keys(cfe.SETTING_ITEMS).forEach((category)=>{
            settings[category] = {};
            if(!('items' in cfe.SETTING_ITEMS[category])) return;
            //  items があれば、その要素ごとループ
            Object.keys(cfe.SETTING_ITEMS[category].items).forEach((item)=>{
                //  デフォルト値を格納
                settings[category][item] =
                    cfe.SETTING_ITEMS[category].items[item].default;
            });
        });
        return settings;
    }

    /**
     * 値に単位を付けて返す。
     * @param {any} value 
     * @param {カテゴリ} category 
     * @param {項目名} item 
     * @returns {string} 単位付きの値
     */
    cfe.addUnit = function (value, category, item) {
        if('unit' in cfe.SETTING_ITEMS[category].items[item] && !isNaN(value)) {
            return `${value}${cfe.SETTING_ITEMS[category].items[item].unit}`;
        }
        return value;
    }
    
})(pblForm);