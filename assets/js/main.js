// Load Model Components (dependencies)

head.load({ js_channels: "assets/js/models/pubnub_presence.js"}, function () {
    modellog.cw("Presence/PresenceView/PresenceList loaded");

    head.load({ js_channels: "assets/js/models/pubnub_message.js"}, function () {
        modellog.cw("Message/MessageView/MessageList loaded");

        head.load({ js_channels: "assets/js/models/pubnub_channel.js"}, function () {
            modellog.cw("Channel/ChannelView/ChannelList loaded");

            head.load({ js_keys: "assets/js/models/pubnub_keys.js"}, function () {
                modellog.cw("Keys/KeysView/KeysList loaded");

                head.load({ js_app: "assets/js/models/pubnub_app.js"}, function () {
                    modellog.cw("App/AppView/AppList loaded");

                    head.load({ js_app: "assets/js/models/pubnub_full_channel_list.js"}, function () {
                        modellog.cw("FullChannelList/FullChannelListView loaded");

                        head.load({ js_model_main: "assets/js/models/pubnub_model_main.js"}, function () {
                            modellog.cw("Collection Views loaded");

                            head.load({ js_user: "assets/js/models/pubnub_user.js"}, function () {
                                modellog.cw("User Model loaded");
                            });

                            head.ready(["js_user"], function(){
                                console.log("COMPLETE: Developer Console Models loaded");
                                console.log("(ready)");
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


    //console.log(CryptoJS.MD5("jasdeep@scalabl3.com").toString());

    DC.dataPanel = $("#pubnub-message-list");
    DC.scrollOffset = 5;
    DC.isWatchingMessage = false;
    DC.isScrolledToBottom = DC.dataPanel.prop('scrollHeight') <= DC.dataPanel.scrollTop() + DC.scrollOffset;
    DC.maxMessages = 100;
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
    DC.checkScroll = function() {
        DC.dataPanel = $("#pubnub-message-list");
        DC.isScrolledToBottom = DC.dataPanel.prop('scrollHeight') - DC.dataPanel.height() <= DC.dataPanel.scrollTop() + DC.scrollOffset;
        //console.log(DC.isWatchingMessage);
    };
    DC.autoScroll = function() {
        // allow 1px inaccuracy by adding 1
        // console.log(DC.dataPanel.prop('scrollHeight') - DC.dataPanel.height(), DC.dataPanel.scrollTop() + DC.scrollOffset);
        // console.log(DC.isScrolledToBottom);
        // scroll to bottom if isScrolledToBottom
        if (DC.isScrolledToBottom && !DC.isWatchingMessage) {
            //DC.dataPanel.animate({scrollTop: (DC.dataPanel.prop('scrollHeight') - DC.dataPanel.height()) }, 100);
            DC.dataPanel.scrollTop((DC.dataPanel.prop('scrollHeight') - DC.dataPanel.height()));
            DC.unseenMessages = 0;
            $("#btn-unseen span").text(DC.unseenMessages);
            $("#btn-unseen").addClass("hidden");
            DC.seenMessages = $("#pubnub-message-list li.msg-item").size();
        }
        else {
            DC.unseenMessages = $("#pubnub-message-list li.msg-item").size() - DC.seenMessages;
            $("#btn-unseen span").text(DC.unseenMessages);
            $("#btn-unseen").removeClass("hidden");
            //console.log("unseen messages: " + DC.unseenMessages.toString());
        }
    };
    DC.scrollToBottom = function() {
        DC.dataPanel.scrollTop((DC.dataPanel.prop('scrollHeight') - DC.dataPanel.height()));
        DC.unseenMessages = 0;
        $("#btn-unseen span").text(DC.unseenMessages);
        $("#btn-unseen").addClass("hidden");

    };
    DC.activateHistoryExplorer = function() {
        $("#panel-stream-message-data").hide();
        $("#panel-full-channel-list").hide();
        $("#panel-history-explorer").show();
    };
    DC.activateFullChannelList = function(){
        $("#panel-history-explorer").hide();
        $("#panel-stream-message-data").hide();
        $("#panel-full-channel-list").show();
    };
    DC.activateStreamMessageData = function(){
        $("#panel-history-explorer").hide();
        $("#panel-full-channel-list").hide();
        $("#panel-stream-message-data").show();
    };
    DC.updatePanelHeaderPresence = function(count){
        $("#panel-presence-occupants div").text(count);
    };
    DC.addDemoAccount = function() {
        var demoAccount = new App({ name: "Demo" });
        demoAccount.addAppKey("Demo", "demo", "demo");
        pubnubAppList.add(demoAccount);
    };
    DC.retrieveChannelInterval = 0;
    DC.checkLocalStorage = function() {
        DC.user = new User({ id: 1 });
        DC.user.fetch({
            success: function(u) {
                console.log("PUBNUB: account - found in local storage, logout enabled");
                DC.setLoggedIn();
                DC.addDemoAccount();
                DC.user.retrieve_apps({
                    success: function() {
                        DC.getCurrentSelection(function(){
                            var app = pubnubAppListView.collection.findWhere({ name: DC.currentSelection.app });
                            if (app) {
                                pubnubAppListView.setSelectedModel(app);

                                var keys = pubnubKeysListView.collection.findWhere({ name: DC.currentSelection.keys });
                                if (keys) {
                                    pubnubKeysListView.setSelectedModel(keys);

                                    var channel = pubnubChannelListView.collection.findWhere({ name: DC.currentSelection.channel });
                                    if (channel) {
                                        pubnubChannelListView.setSelectedModel(channel);
                                    }
                                    else if (DC.currentSelection.channel.length > 0 ){
                                        keys.add_channel(DC.currentSelection.channel, true);
                                        channel = pubnubChannelListView.collection.findWhere({ name: DC.currentSelection.channel });
                                        pubnubChannelListView.setSelectedModel(channel);
                                    }
                                }
                            }
                            else {
                                DC.resetCurrentSelection();
                            }
                        });
                    }
                });
                DC.user.save();
            },
            error: function() {
                DC.user = null;
                console.log("PUBNUB: account - not in local storage, login enabled");
            }
        });
    };
    DC.setLoggedIn = function() {

        // enable login button after 1 second (prevents double clicks, multiple logins)
        setTimeout(function(){
            DC.loggingIn = false;
        }, 1000);

        $("#btn-login-action").prop("disabled", false);
        $('#modal-pubnub-login').modal('hide');
        $("#pubnub-login").addClass("hidden");
        $("#pubnub-logout").removeClass("hidden");
    };

    DC.checkLocalStorage();
});
