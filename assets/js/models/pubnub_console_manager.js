DC.BaseClasses.console = stampit().enclose(function () {

    var _user = null;
    var _loggingIn = false;

    function _hideAllLeftPanels() {
        $("#panel-history-explorer").hide();
        $("#panel-stream-message-data").hide();
        $("#panel-full-channel-list").hide();
        $("#panel-console-settings").hide();
        $("#panel-pam-manager").hide();
    }

    function _hideAllRightPanels(){
        $("#presence-panel").hide();
        $("#panel-empty-right").hide();
        $("#panel-history-form").hide();
    }

    // Public API
    return stampit.mixIn(this, {
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
        activateHistoryExplorer: function() {
            _hideAllLeftPanels();
            _hideAllRightPanels();
            $("#panel-history-explorer").show();
            $("#panel-history-form").show();
        },
        activateFullChannelList: function(){
            _hideAllLeftPanels();
            $("#panel-full-channel-list").show();
        },
        activateStreamMessageData: function(){
            _hideAllLeftPanels();
            $("#panel-stream-message-data").show();
            $("#panel-presence").show()
        },
        activatePAM: function() {
            _hideAllLeftPanels();
            $("#panel-pam-manager").show();
        },
        activateConsoleSettings: function() {
            _hideAllLeftPanels();
            _hideAllRightPanels();
            $("#panel-console-settings").show();
            $("#panel-empty-right").show();
        },
        updatePanelHeaderPresence: function(count){
            $("#panel-presence-occupants div").text(count);
        }
    });
});

DC.App = new DC.BaseClasses.console();