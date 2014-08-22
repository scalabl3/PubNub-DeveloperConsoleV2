// Load Model Components (dependencies)

head.load({ js_channels: "assets/js/models/pubnub_presence.js"}, function () {
    modellog.cw("Presence/PresenceView/PresenceList loaded");

    head.load({ js_message: "assets/js/models/pubnub_message.js"}, function () {
        modellog.cw("Message/MessageView/MessageList loaded");

        head.load({ js_channels: "assets/js/models/pubnub_channel.js"}, function () {
            modellog.cw("Channel/ChannelView/ChannelList loaded");

            head.load({ js_keys: "assets/js/models/pubnub_keys.js"}, function () {
                modellog.cw("Keys/KeysView/KeysList loaded");

                head.load({ js_app: "assets/js/models/pubnub_app.js"}, function () {
                    modellog.cw("App/AppView/AppList loaded");

                    head.load({ js_app: "assets/js/models/pubnub_full_channel_list.js"}, function () {
                        modellog.cw("FullChannelList/FullChannelListView loaded");

                        head.load({ js_app: "assets/js/models/pubnub_localstore.js"}, function () {
                            modellog.cw("LocalStore loaded");

                            head.load({ js_app: "assets/js/models/pubnub_console_manager.js"}, function () {
                                modellog.cw("Console Manager loaded");

                                head.load({ js_model_main: "assets/js/models/pubnub_model_main.js"}, function () {
                                    modellog.cw("Collection Views loaded");

                                    head.load({ js_user: "assets/js/models/pubnub_user.js"}, function () {
                                        modellog.cw("User Model loaded");
                                    });

                                    head.ready(["js_user"], function(){
                                        console.log("COMPLETE: Developer Console Models loaded");
                                        console.log("(ready)");
                                        modelReady();
                                    });

        //                            head.load({ js_test: "assets/js/test_models.js"}, function () {
        //                                modellog.cw("Test Script loaded");
        //                            });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

var modelReady = function() {
    // READY Events
    $(document).ready(function(){
        $("#nav-primary-toggle").click(function(){
            $("#nav-primary").toggleClass("contract");
            $("#flow-header").toggleClass("expand");
        });
        $("#nav-primary-toggle2").click(function(){
            $("#nav-primary").toggleClass("contract");
            $("#flow-header").toggleClass("expand");
        });
        $("body").css("display", "block");

        $('#pubnub-logout').click(function(e){
            pubnubAppListView.reset();
            pubnubAppList.reset();

            DC.user.sync("delete", DC.user);
            DC.user = null;
            console.log("PUBNUB: account - logout successful");

            $("#pubnub-logout").addClass("hidden");
            $("#pubnub-login").removeClass("hidden");
        });

        $("#btn-unseen").click(function(e){
            e.preventDefault();
            DC.scrollToBottom();
        });

        $("#btn-login-action").click(function(e){

            // login state (prevents double clicks, multiple logins)
            if (!DC.loggingIn) {
                DC.loggingIn = true;


                var btn = $("#btn-login-action");

                if ($("#email").val() !== "") {

                    if ($("#password").val() !== "") {

                        DC.user = new User({ id: 1 });
                        btn.prop("disabled", true);
                        DC.user.retrieve_account({
                            email: $("#email").val(),
                            password: $("#password").val(),
                            success: function(){
                                DC.setLoggedIn();
                                DC.addDemoAccount();
                                if ($("#remember").prop('checked')) {
                                    // Store the appropriate info here
                                    console.log(DC.user.get("token"));
                                    DC.user.save();
                                }

                            },
                            error: function() {
                                btn.prop("disabled", false);
                                DC.loggingIn = false;
                            }
                        });
                    }
                    else {
                        console.log("PUBNUB: account - password missing");
                    }
                }
                else {
                    console.log("PUBNUB: account - email missing");
                }
            }
        });

        $("#panel-stream-message-data-infobar div.autoscroll-play button").click(function(){
            DC.pauseDataStreamScroll();
            DC.autoScrollPaused = true;
        });

        $("#panel-stream-message-data-infobar div.autoscroll-pause button").click(function(){
            DC.scrollToBottom();
            DC.autoScrollPaused = false;
            DC.resumeDataStreamScroll();
        });

        $("#btn-publish").click(function(){
            if ($("#publish-message").val().length > 0) {
                var msg = $("#publish-message").val();
                var k = pubnubKeysListView.getSelectedModel();
                if (k) {
                    var c = pubnubChannelListView.getSelectedModel();
                    if (c) {
                        k.publish_message(c.get("name"), msg);
                    }
                }
            }
        });

        $("#console-settings").click(function(){
            pubnubChannelListView.unwatch_channels(true);
            DC.App.activateConsoleSettings();
        });

        $("#console-help").click(function(){

        });

        $("#btn-history-recent").click(function(e) {
            e.preventDefault();
            var channel = pubnubChannelListView.getSelectedModel();
            channel.get("appKeys").get_history({ channel: channel.get("name"), count: parseInt($("#history-recent-count").val()), reverse: true })

        });

        $("#btn-history-oldest").click(function(e) {
            e.preventDefault();
            var channel = pubnubChannelListView.getSelectedModel();
            channel.get("appKeys").get_history({ channel: channel.get("name"), count: parseInt($("#history-recent-count").val()) })

        });

        //console.log(CryptoJS.MD5("jasdeep@scalabl3.com").toString());

        DC.dataPanel = $("#pubnub-message-list");

        DC.loggingIn = false;
        DC.currentSelection = {
            app: "",
            keys: "",
            channel: ""
        };
        DC.saveCurrentSelection = function() {
            localStorage.setItem("currentSelection", JSON.stringify(DC.currentSelection));
        };
        DC.getCurrentSelection = function(complete) {
            DC.currentSelection = JSON.parse(localStorage.getItem("currentSelection"));

            if (!DC.currentSelection || DC.currentSelection == null || !DC.currentSelection.app || DC.currentSelection.app == null) {
                DC.resetCurrentSelection();
            }

            if (complete && _.isFunction(complete)) {
                complete(DC.currentSelection);
            }
        };
        DC.resetCurrentSelection = function(){
            DC.currentSelection = {
                app: "",
                keys: "",
                channel: ""
            };
            DC.saveCurrentSelection();
        };

        DC.scrollOffset = 5;
        DC.maxMessages = 100;
        DC.autoScrollPaused = false;
        DC.isScrolledToBottom = DC.dataPanel.prop('scrollHeight') <= DC.dataPanel.scrollTop() + DC.scrollOffset;
        DC.checkScroll = function() {
            DC.dataPanel = $("#pubnub-message-list");
            DC.isScrolledToBottom = DC.dataPanel.prop('scrollHeight') - DC.dataPanel.height() <= DC.dataPanel.scrollTop() + DC.scrollOffset;
        };

        DC.autoScroll = function() {
            // allow 1px inaccuracy by adding 1
            // scroll to bottom if isScrolledToBottom
            if (!DC.autoScrollPaused) {
                DC.seenMessages = $("#pubnub-message-list li.msg-item").size();
                DC.resumeDataStreamScroll();
            }
            else {
                DC.pauseDataStreamScroll();
            }
        };
        DC.resumeDataStreamScroll = function() {
            DC.autoScrollPaused = false;
            DC.scrollToBottom();
            $("#panel-stream-message-data-infobar").removeClass("bg-paused");
            $("#panel-stream-message-data-infobar").addClass("bg-success");
            $("#panel-stream-message-data-infobar div.autoscroll-play").removeClass("hidden");
            $("#panel-stream-message-data-infobar div.autoscroll-pause").addClass("hidden");
            $("#panel-stream-message-data-infobar div.autoscroll-new-count").addClass("hidden");
        };
        DC.pauseDataStreamScroll = function() {
            DC.autoScrollPaused = true;
            $("#panel-stream-message-data-infobar").addClass("bg-paused");
            $("#panel-stream-message-data-infobar").removeClass("bg-success");
            $("#panel-stream-message-data-infobar div.autoscroll-play").addClass("hidden");
            $("#panel-stream-message-data-infobar div.autoscroll-pause").removeClass("hidden");
            $("#panel-stream-message-data-infobar div.autoscroll-new-count").removeClass("hidden");
        };
        DC.scrollToBottom = function() {
            DC.dataPanel.scrollTop((DC.dataPanel.prop('scrollHeight') - DC.dataPanel.height()));
        };
        DC.updateInfoBar = function(stats){
            $("#panel-infobar-new").text(stats.messagesNew);
            $("#panel-infobar-total").text(stats.messagesReceived);
            $("#panel-infobar-display").text(stats.messagesDisplayed);
        };


        DC.retrieveChannelInterval = 0;
        DC.isotopeActive = false;
        DC.isotopeSort = ['subscribed', 'occupants', 'name'];
        DC.isotopeSortByName = function() {
            if (DC.isotopeActive) {
                $("#panel-full-channel-list div.list-header div.name span").addClass("sortedby");
                $("#panel-full-channel-list div.list-header div.occupants span").removeClass("sortedby");
                DC.isotopeSort = ['subscribed', 'name', 'occupants'];
                $("#full-channel-list").isotope({ sortBy: DC.isotopeSort });
            }
        };
        DC.isotopeSortByOccupants = function(){
            if (DC.isotopeActive) {
                $("#panel-full-channel-list div.list-header div.occupants span").addClass("sortedby");
                $("#panel-full-channel-list div.list-header div.name span").removeClass("sortedby");
                DC.isotopeSort = ['subscribed', 'occupants', 'name'];
                $("#full-channel-list").isotope({ sortBy: DC.isotopeSort });
            }
        };

//        DC.checkLocalStorage = function() {
//            DC.user = new User({ id: 1 });
//            DC.user.fetch({
//                success: function(u) {
//                    console.log("PUBNUB: account - found in local storage, logout enabled");
//                    DC.setLoggedIn();
//                    DC.addDemoAccount();
//                    DC.user.retrieve_apps({
//                        success: function() {
//                            DC.getCurrentSelection(function(){
//                                var app = pubnubAppListView.collection.findWhere({ name: DC.currentSelection.app });
//                                if (app) {
//                                    pubnubAppListView.setSelectedModel(app);
//
//                                    var keys = pubnubKeysListView.collection.findWhere({ name: DC.currentSelection.keys });
//                                    if (keys) {
//                                        pubnubKeysListView.setSelectedModel(keys);
//
//                                        var channel = pubnubChannelListView.collection.findWhere({ name: DC.currentSelection.channel });
//                                        if (channel) {
//                                            pubnubChannelListView.setSelectedModel(channel);
//                                        }
//                                        else if (DC.currentSelection.channel.length > 0 ){
//                                            keys.add_channel(DC.currentSelection.channel, true);
//                                            channel = pubnubChannelListView.collection.findWhere({ name: DC.currentSelection.channel });
//                                            pubnubChannelListView.setSelectedModel(channel);
//                                        }
//                                    }
//                                }
//                                else {
//                                    DC.resetCurrentSelection();
//                                }
//                            });
//                        }
//                    });
//                    DC.user.save();
//                },
//                error: function() {
//                    DC.user = null;
//                    console.log("PUBNUB: account - not in local storage, login enabled");
//                }
//            });
//        };
//        DC.setLoggedIn = function() {
//
//            // enable login button after 1 second (prevents double clicks, multiple logins)
//            setTimeout(function(){
//                DC.loggingIn = false;
//            }, 1000);
//
//            $("#btn-login-action").prop("disabled", false);
//            $('#modal-pubnub-login').modal('hide');
//            $("#pubnub-login").addClass("hidden");
//            $("#pubnub-logout").removeClass("hidden");
//        };

        DC.LocalStore.init();
    });
};