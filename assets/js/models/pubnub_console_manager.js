DC.BaseClasses.console = stampit().enclose(function () {

    var _user = null;
    var _loggingIn = false;
    var _consoleAuthKey = "";

    function _hideAllLeftPanels(complete) {
        $("div.panel-left").hide({
            duration: 0,
            complete: function() {
                if (_.isFunction(complete)) {
                    complete();
                }
            }
        });
    }

    function _hideAllRightPanels(complete){
        $("div.panel-right").hide({
            duration: 0,
            complete: function() {
                if (_.isFunction(complete)) {
                    complete();
                }
            }
        });
    }

    function _channelFullListHandlers(){
        $("#form-add-channel").submit(function(e) {
            e.preventDefault();
            var keys = pubnubKeysListView.getSelectedModel();
            if ($("#add-channel-name").val().length > 1) {
                keys.add_channel($("#add-channel-name").val(), $("#add-channel-subscribe").prop('checked'), function(){
                    setTimeout(function() {
                        pubnubFullChannelList.retrieve_channels();
                    }, 1500);
                });
            }
        });
    }

    function _pamFormHandlers() {
        $("#form-pam-console-authkey").submit(function(e) {
            e.preventDefault();
            DC.App.user.set("consoleAuthKey", $("#pubnub-console-authkey").val());
            DC.App.user.set("autoGrantPAM", $("#pubnub-console-autogrant-pam").prop('checked'));
            DC.App.user.save();
        });

        $("#form-pam-update-global").submit(function(e){
            e.preventDefault();
            var keys = pubnubKeysListView.getSelectedModel();
            keys.pam_grant({
                global: true,
                ttl: $("#pubnub-authkey-ttl").val(),
                pub: $("#pubnub-pam-global-write").prop("checked"),
                sub: $("#pubnub-pam-global-read").prop("checked")
            });
        });

        $("#form-pam-addkey").submit(function(e){
            e.preventDefault();
            var keys = pubnubKeysListView.getSelectedModel();
            keys.pam_grant({
                global: false,
                channel: $("#pubnub-pam-channel-name").val(),
                authkey: $("#pubnub-pam-channel-authkey").val(),
                pub: $("#pubnub-pam-channel-write").prop("checked"),
                sub: $("#pubnub-pam-channel-read").prop("checked"),
                ttl: $("#pubnub-pam-channel-ttl").val(),
                presence: $("#pubnub-pam-channel-presence").prop("checked")
            });
        });
    }

    function _pamButtons() {
        $("#btn-generate-authkey").click(function(e){
            var key = "devconsole-";
            _.times(10, function() {
               key += (Math.floor((Math.random() * 9) + 1)).toString();
            });
            $("#pubnub-console-authkey").val(key);
        });

        $("#btn-pam-audit-reload").click(function(e){
            var keys = pubnubKeysListView.getSelectedModel();
            if (keys && keys.get("hasPAM")) {
                DC.App.updatingPAM();
                keys.pam_audit();
            }

        });
    }

    function _dataStreamFormHandlers() {
        $("#form-data-publish").submit(function (e) {
            e.preventDefault();
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
    }

    function _initializeForms() {
        _dataStreamFormHandlers();
        _channelFullListHandlers();
        _pamFormHandlers();
    }

    function _initializeButtons() {
        _pamButtons();
    }

    // Public API
    return stampit.mixIn(this, {
        init: function() {
            _initializeForms();
            _initializeButtons();
        },
        user: function(v) {
            if (v) {
                _user = v;
                return this;
            }
            return _user;
        },
        isLoggingIn: function(v) {
            if (v) {
                _loggingIn = v;
                return this;
            }
            return _loggingIn;
        },
        setLoggedIn: function() {

            var self = this;
            // enable login button after 1 second (prevents double clicks, multiple logins)
            setTimeout(function(){
                self.isLoggingIn(false);
            }, 1000);

            $("#btn-login-action").prop("disabled", false);
            $('#modal-pubnub-login').modal('hide');
            $("#pubnub-login").addClass("hidden");
            $("#pubnub-logout").removeClass("hidden");
        },
        showPAM: function() {
            $("#panel-pam-manager .pam-disabled").hide();
            $("#panel-pam-manager .pam-enabled").show();
        },
        hidePAM: function() {
            $("#panel-pam-manager .pam-enabled").hide();
            $("#panel-pam-manager .pam-disabled").show();
        },
        updatingPAM: function() {
            $("#pam-audit-updating").css('display', 'inline-block');
        },
        updatingPAMComplete: function(){
            $("#pam-audit-updating").css('display', 'none');
        },
        activateInitialView: function(){
            setTimeout(function(){
                //$("#nav-pubnub-channel-list li.selected").find('.action-history').trigger('click');
            }, 1000);
        },
        activateHistoryExplorer: function() {
            _hideAllLeftPanels(function(){
                $("#panel-history-explorer").show();
            });
            _hideAllRightPanels(function(){
                $("#panel-history-form").show();
            });
        },
        activateFullChannelList: function(){
            _hideAllLeftPanels(function(){
                $("#panel-full-channel-list").show();
             });
            _hideAllRightPanels(function() {
                $("#panel-empty").show();
            });
        },
        activateStreamMessageData: function(){
            _hideAllLeftPanels(function() {
                $("#panel-stream-message-data").show();
            });
            _hideAllRightPanels(function() {
                $("#panel-presence").show();
            });
        },
        activatePAM: function(level, name) {
            if (name) {
                $("#panel-pam-manager div.panel-toolbar-title span").text("at level " + level + "::" + name);
                if (level === "Channel") {
                    $("#pubnub-authkey-channel").val(name);
                }
            }
            else {
                $("#panel-pam-manager div.panel-toolbar-title span").text("");
            }

            _hideAllLeftPanels(function() {
                $("#panel-pam-manager").show();
            });
            _hideAllRightPanels(function() {
                $("#panel-pam-audit").show();
            });
        },
        activateConsoleSettings: function() {
            _hideAllLeftPanels(function() {
                $("#panel-console-settings").show();
            });
            _hideAllRightPanels(function() {
                $("#panel-empty").show();
            });
        },
        updatePanelHeaderPresence: function(count){
            $("#panel-presence-occupants div").text(count);
        },
        checkValue: function (x, type, value) {
            if (typeof x === 'undefined') {
                return false;
            }
            if (type === 'int') {
                try {
                    y = parseInt(x);
                }
                catch (e) {
                    return false;
                }
                if (_.isUndefined(value)) {
                    return y;
                }
                else {
                    return y === value;
                }
            }
        }
    });
});

DC.App = new DC.BaseClasses.console();
DC.App.init();