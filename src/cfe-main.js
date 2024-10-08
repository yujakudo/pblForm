/**
 * cfe-main.js
 * HTMLから最初に呼び出される関数とライブラリ
 * @copyright   2024 Yujakudo
 */

/**
 * パネル.
 * 設定を行うパネルを定義する形。
 * @typedef {Object} Panel
 * @property {string}   id      パネルの ID。パスカルケース
 * @property {string}   title   表示されるタイトル
 * @property {string[]} items   設定項目の名前。キャメルケース。
 *                              タグのID(スネークケース)と同じにする。
 * @property {string}   content 挿入するHTML
 * @property {function(cfe.clsController)} initialize  初期化関数。
 *          引数はコントローラ。イベントハンドラの登録などをする。
 *          ハンドラの中ではコントローラの onPanelChange をコールし、
 *          コントローラにUIの変更を通知する。
 * @property {function(string)} getStatus   UI の状態を取得する。
 *          引数は、itemsにある項目名。項目に対応するコントロールの値を返す。
 * @property {Function(any, string)} setStatus  UIの状態を設定する。
 *          引数は、設定する値と、items にある項目名。
 */

/**
 * ツール.
 * エディタの状態や機能をコントロールするツールを定義する型.
 * @typedef {Object} Tool
 * @property {string}   id      ツールの ID。パスカルケース
 * @property {string[]} items   設定項目の名前。キャメルケース。
 * @property {string}   content 挿入する HTML
 * @property {function(cfe.clsController)} initialize  初期化関数。
 *          引数はコントローラ。イベントハンドラの登録などをする。
 *          ハンドラの中ではコントローラの onToolChange をコールし、
 *          コントローラにUIの変更を通知する。
 * @property {function(string)} getStatus   UI の状態を取得する。
 *          引数は、items にある項目名。項目に対応するコントロールの値を返す。
 * @property {Function(any, string)} setStatus  UI の状態を設定する。
 *          引数は、設定する値と、items にある項目名。
 */

/**
 * pblFormの開始.
 * 初期化してpblFormを開始する。
 * @param {Object} settings 設定
 */
var pblForm = function (settings) {
    pblForm.initialize(settings);
};

((cfe)=>{

    /**
     * 初期化
     * @function
     * @param {Object} settings 設定値 
     */
    cfe.initialize = (settings) => {
        cfe.loadScripts(function () {
            cfe.Controller = new cfe.clsController(settings);
            if(undefined!==settings && 'initialize' in settings) {
                settings.initialize();
            }
        });
    }

    /**
     * CSSファイル
     */
    cfe.CSSES = [
        'cfe-main.css', 'cfe-form.css', 'cfe-tab-panels.css',
        'panels/pnl-paper.css',
        'tools/cfe-zoom.css'
    ];

    /**
     * スクリプトファイル
     */
    cfe.SCRIPTS = [
        'cfe-main.js', 'cfe-controller.js', 'cfe-model.js',
        'cfe-form.js', 'cfe-tools.js', 'cfe-tab-panels.js',
        'panels/pnl-paper.js',
        'tools/cfe-zoom.js'
    ];

    /**
     * CSS、JSファイルを読み込むタグの挿入
     * @function
     * @param {string[]} csses      CSSファイルの名前の配列。未指定の場合はデフォルトの値を使用。
     * @param {string[]} scripts JSファイルの名前の配列。未指定の場合はデフォルトの値を使用。 
     */
    cfe.loadScripts = (callback, csses, scripts) => {
        csses = csses || cfe.CSSES;
        scripts = scripts || cfe.SCRIPTS;
        
        //  CSSは設定されているか？
        let is_css = ($('#editor-container').attr('display')=='flex');
        if(!is_css) {
            // CSSファイルをHTMLに挿入
            for (const css of csses) {
                if( $(`link[href="${css}"]`).length==0 ) {
                    $('<link>')
                        .attr('rel', 'stylesheet')
                        .attr('href', css)
                        .appendTo('head');
                }
            }
        }
    
        //  JSは読み込まれているか？（コントロールクラスがあればたぶんOK）
        let is_js = (undefined !== cfe.clsController);
        if(is_js) {
            $(document).ready(callback);
        } else {
            let loading = 0;
            let loaded = 0;
            // JSファイルをHTMLに挿入
            for (const script of scripts) {
                if( $(`script[src="${script}"]`).length==0 ) {
                    loading++;
                    $('<script>')
                        .attr('src', script)
                        .attr('type', 'text/javascript')
                        .on('load', function() {
                            loaded++;
                            // すべてのスクリプトが読み込まれたらコールバックを実行
                            if (loaded == loading) {
                                callback();
                            }
                        }).appendTo('body');
                }
            }
        }
    };

    /**
    * キャメルケースへ変換する
    * @function
    * @param {string} str 文字列
    * @return {string} 変換した文字列
    */
    cfe.toCamelCase = function(str) {
        let words = str.split(/[-_ ]+/);
        let result = words[0].toLowerCase();
        for (let i=1; i < words.length; i++) {
            result += words[i].substring(0,1).toUpperCase();
            if(words[i].length>1) {
                result += words[i].substring(1).toLowerCase();
            }
        }
        return result;
    };

    /**
     * スネークケースに変換する
    * @function
     * @param {string} str 文字列 
     * @param {string} delimitor 区切り文字。省略時は、'-'（ハイフン）で区切る
     * @returns 
     */
    cfe.toSnakeCase = function(str, delimitor) {
        delimitor = delimitor || '-';
        return str.split(/(?=[A-Z])/).join(delimitor).toLowerCase();
    };


})(pblForm);
