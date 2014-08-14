// Load Javascript Libraries
head.load({js_consolelog: "assets/js/console_logging.js"}, function () {

    head.load({css: "devconsole_css.js"}, function(){

        DC.log("LOAD: JS Libraries");

        // Load Javascript Libraries
        head.load({js_taffy: "//cdnjs.cloudflare.com/ajax/libs/taffydb/2.7.2/taffy-min.js"}, function () {
            jslog.gw("TaffyDB 2.7.2 loaded");
        });

        head.load({js_jquery: "//code.jquery.com/jquery-2.1.1.min.js"}, function () {
            jslog.gw("JQuery 2.1.1 loaded");

            head.load({ moment: "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.7.0/moment.min.js"}, function(){
                jslog.gw("MomentJS 2.7.0 loaded");
            });

            head.load({ crypto: "//cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/md5.js"}, function(){
                jslog.gw("CryptoJS 3.1.2 loaded");
            });
        });

        head.load({ js_jqueryUI: "//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js"}, function(){
            jslog.gw("JQuery UI 1.10.4 loaded");
        });

        head.load({ js_pubnub: "//cdn.pubnub.com/pubnub.min.js"}, function () {
            jslog.gw("PubNub 3.6.6 SDK loaded");
        });

        head.load({ js_extensions: "assets/js/extensions.js"}, function () {
            jslog.gw("Prototype Extensions loaded");
        });

        head.load({ js_bootstrap: "//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"}, function () {
            jslog.gw("Bootstrap 3.2.0 JS loaded");
        });

        head.load({ js_underscore: "assets/jslibs/underscore-1.6.0.js"}, function () {
            jslog.gw("Underscore 1.6.0 JS loaded")
        });

        head.ready(["js_jquery", "js_pubnub", "js_underscore", "js_taffy"], function () {

            head.load({ js_backbone: "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min.js"}, function () {
                jslog.gw("Backbone 1.1.2 loaded ");

                head.load([
                    { js_bbcollectionView: "//cdnjs.cloudflare.com/ajax/libs/backbone.collectionView/0.10.1/backbone.collectionView.min.js"},
                    { js_marionette: "//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.0.3/backbone.marionette.min.js"},
                    { js_bblocalstore: "//cdnjs.cloudflare.com/ajax/libs/backbone-localstorage.js/1.1.9/backbone.localStorage.js"}
                ], function() {
                    jslog.gw("Backbone Collection View 0.10.1 loaded");
                    jslog.gw("Marionette 2.0.3 loaded");
                    jslog.gw("Backbone LocalStorage 1.1.9 loaded");
                });
            });


            head.load({js_handlebars: "//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.3.0/handlebars.min.js"}, function () {
                jslog.gw("Handlebars 1.3.0 loaded");
            });

            head.ready(["js_backbone", "js_handlebars"], function () {

                head.load({ js_main: "assets/js/main.js"}, function () {

                });

                head.ready("js_main", function(){
                    console.log("COMPLETE: JS/CSS PRE-REQUISITES loaded");
                });

            });

        });
    });
});

//head.load({ panel_manager: "assets/js/panel_manager.js"}, function() {
//		console.log("Panel Manager loaded");
//});
//
//head.ready("panel_manager", function() {
//		console.log("Panel Manager ready");
//		var resize = $(window).on('resize', function(){
//			 //console.log("Browser resized");
//			 panelManager.resizePanels(false);
//		}).trigger('resize'); //on page load
//});
//
//head.load([{ devconsole_model: "assets/js/devconsole_model.js" }, { devconsole_controller: "assets/js/devconsole_controller.js" }], function() {
//		console.log("DevConsole Model+Controller JS loaded");
//});
//
//head.ready(["devconsole_model", "devconsole_controller"], function() {
//		console.log("DevConsole Model+Controller ready");
//		window.dc.dcm = devConsoleModel.getInstance();
//		window.dc.dcc = devConsoleController.getInstance();
//});
