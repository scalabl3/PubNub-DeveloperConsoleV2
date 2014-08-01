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

        DC.user = null;
        console.log("PUBNUB: account - logout successful");

        $("#pubnub-logout").addClass("hidden");
        $("#pubnub-login").removeClass("hidden");
    });
    $("#btn-login-action").click(function(e){

        // login state (prevents double clicks, multiple logins)
        if (!DC.loggingIn) {
            DC.loggingIn = true;


            var btn = $("#btn-login");

            if ($("#email").val() !== "") {

                if ($("#password").val() !== "") {

                    DC.user = new User();
                    btn.prop("disabled", true);
                    DC.addDemoAccount();
                    DC.user.retrieve_account({
                        email: $("#email").val(),
                        password: $("#password").val(),
                        success: function(){
                            $('#modal-pubnub-login').modal('hide');
                            $("#pubnub-login").addClass("hidden");
                            $("#pubnub-logout").removeClass("hidden");
                            btn.prop("disabled", false);

                            // enable login button after 1 second (prevents double clicks, multiple logins)
                            setTimeout(function(){
                                DC.loggingIn = false;
                            }, 1000);

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

    $("#link-view-all-channels").click(function(e){
        e.preventDefault();
        DC.activateFullChannelList();
        pubnubFullChannelListView.assign_collection(pubnubFullChannelList);
    });

    //console.log(CryptoJS.MD5("jasdeep@scalabl3.com").toString());

    DC.dataPanel = $("#pubnub-message-list");
    DC.scrollOffset = 5;
    DC.isWatchingMessage = false;
    DC.isScrolledToBottom = DC.dataPanel.prop('scrollHeight') <= DC.dataPanel.scrollTop() + DC.scrollOffset;
    DC.maxMessages = 100;
    DC.loggingIn = false;
    DC.checkScroll = function() {
        DC.dataPanel = $("#pubnub-message-list");
        DC.isScrolledToBottom = DC.dataPanel.prop('scrollHeight') - DC.dataPanel.height() <= DC.dataPanel.scrollTop() + DC.scrollOffset;
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
            DC.seenMessages = $("#pubnub-message-list li.msg-item").size();
        }
        else {
            DC.unseenMessages = $("#pubnub-message-list li.msg-item").size() - DC.seenMessages;
            console.log("unseen messages: " + DC.unseenMessages.toString());
        }
    };
    DC.activateFullChannelList = function(){
        $("#panel-stream-message-data").hide();
        $("#panel-full-channel-list").show();
    };
    DC.activateStreamMessageData = function(){
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
    }
});