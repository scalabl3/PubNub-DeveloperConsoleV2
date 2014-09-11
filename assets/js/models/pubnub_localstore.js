DC.BaseClasses.localstore = stampit().enclose(function () {

    var _initialStructure = {
        app: "",
        keys: "",
        channel: "",
        channelList: {
            "[NONE]": {}
        }
    };

    var _current = {
        app: "",
        keys: "",
        channel: "",
        channelList: {
            "[NONE]": {}
        }
    };

    function _add_channel (appName, keysName, channel_or_channels) {

        console.log(appName, keysName, channel_or_channels, _current);

        if (_.isString(channel_or_channels)) {
            // Add if unique
            if (_.indexOf(_current.channelList[appName][keysName], channel_or_channels) === -1) {
                _current.channelList[appName][keysName].push(channel_or_channels);
            }
        }
        // When setting an array, replace list
        else if (_.isArray(channel_or_channels)) {
            _current.channelList[appName][keysName] = channel_or_channels;
        }

    }

    // Public API
    return stampit.mixIn(this, {
        init: function() {

            var self = this;
            var user = new User({ id: 1 });
            user.fetch({
                success: function(u) {
                    console.log("PUBNUB: account - found in local storage, logout enabled");
                    DC.App.setLoggedIn();
                    user.retrieve_apps({
                        success: function() {
                            user.save();
                            DC.App.user = user;
                            self.getCurrentSelection(function(){
                                // Insert the Demo Account into the App List
                                pubnubAppList.addDemoAccount();
                                self.activateCurrentSelection();
                            });
                        }
                    });
                },
                error: function() {
                    console.log("PUBNUB: account - not in local storage, login enabled");
                    DC.App.user(null);
                }
            });

            return this;
        },
        app: function(v) {
            if (_.isUndefined(_current.channelList)) {
                _current.channelList = {};
            }
            if (v) {
                _current.app = v;
                if (_.isUndefined(_current.channelList[v])) {
                    _current.channelList[v] = {};
                }
                this.saveCurrentSelection();
                return this;
            }
            return _current.app;
        },
        app_keys: function(v) {
            if (v) {
                _current.keys = v;
                if (_.isUndefined(_current.channelList[_current.app][v])) {
                    _current.channelList[_current.app][v] = [];
                }
                this.saveCurrentSelection();
                return this;
            }
            return _current.keys;
        },
        current_channel: function(v) {
            if (v) {
                _current.channel = v;
                this.saveCurrentSelection();
                return this;
            }
            return _current.channel;
        },
        remove_channel: function(appName, keysName, channelName) {
            console.json(_current.channelList);
            console.log(_.pull(_current.channelList[appName][keysName], channelName));
            console.json(_current.channelList);
            this.saveCurrentSelection();
            return this;
        },
        channels: function(appName, keysName, channel_or_channels) {
            if (appName && keysName && channel_or_channels) {
                //console.log(v);
                // If channelList not initialized with App Name and AppKeys Name
                if (!_.isObject(_current.channelList[appName])) {
                    _current.channelList[appName] = {};
                    _current.channelList[appName][keysName] = [];
                    this.saveCurrentSelection();
                }

                _add_channel(appName, keysName, channel_or_channels);

                this.saveCurrentSelection();

                return this;
            }
            else {
                return _current.channelList;
            }
        },
        currentSelection: function() {
            return _current;
        },
        activateCurrentSelection: function() {
            // From LocalStorage to _current, Add all the Channels for Each AppKeys in each App

            // For each App in _current.channelList
            _.forEach(_.keys(_current.channelList), function(appName) {

                // Find the App Object for this name
                var thisApp = pubnubAppList.findWhere({ name: appName });

                // If the App Exists
                if (thisApp) {

                    var thisAppKeys = thisApp.get("appKeys");

                    if (thisAppKeys) {

                        // For Each AppKeys in _current.channelList[appName]
                        _.forEach(_.keys(_current.channelList[appName]), function(appKeysName) {

                            var keys = thisAppKeys.findWhere({ name: appKeysName });

                            // If the Keys Name exists
                            if (keys) {

                                // For Each Channel in _current.channelList[appName][appKeysName]
                                _.forEach(_current.channelList[appName][appKeysName], function(chan){
                                    //console.log("add_channel: ", appName, appKeysName, chan, " ++ ", keys.get("name"));
                                    keys.add_channel(chan, false, null, true);
                                });
                            }
                        });
                    }

                }

            });

            // From LocalStorage, activate (select) the last selected App/AppKeys/Channel
            var app = pubnubAppListView.collection.findWhere({ name: _current.app });

            if (app) {

                // Select the found App
                pubnubAppListView.setSelectedModel(app);

                var keys = pubnubKeysListView.collection.findWhere({ name: _current.keys });

                if (keys) {

                    // Select the found AppKeys
                    pubnubKeysListView.setSelectedModel(keys);


                    var channel = pubnubChannelListView.collection.findWhere({ name: _current.channel });

                    if (!_.isUndefined(channel)) {

                        // Select the found Channel
                        pubnubChannelListView.setSelectedModel(channel);

                        DC.App.activateInitialView();

                    }
                    else {
                        _current.channel = "";
                    }
                }
                else {
                    _current.keys = "";
                }
            }
            else {
                this.resetCurrentSelection();
            }
        },
        saveCurrentSelection: function() {
            //console.log("SAVE");
            //console.json(_current);
            localStorage.setItem("currentSelection", JSON.stringify(_current));
        },
        getCurrentSelection: function(completeCallback) {
            _current = JSON.parse(localStorage.getItem("currentSelection"));
            console.log(JSON.stringify(JSON.parse(localStorage.getItem("currentSelection")), true, 2));
            if (!_current || _current == null || !_current.app || _current.app == null) {
                console.log("Something emptying!");
                console.json(_current);
                this.resetCurrentSelection();
            }

            if (_.isFunction(completeCallback)) {
                completeCallback(DC.currentSelection);
            }
        },
        resetCurrentSelection: function(){
            _current = JSON.deepCopy(_initialStructure);
            this.saveCurrentSelection();
        }
    });
});

DC.LocalStore = new DC.BaseClasses.localstore();