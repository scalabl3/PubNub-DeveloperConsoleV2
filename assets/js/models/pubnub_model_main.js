// requires Presence, Message, Channel, Keys, App
//
// pubnubAppList
// pubnubAppListView
// pubnubKeysListView
// pubnubChannelListView
// pubnubMessageListView
// pubnubPresenceListView
//
// TODO: pubnubAllChannelsView
// TODO: load Apps/AppKeys from Account
// TODO: Manual Subscribe to Channel
// TODO: Auto-Publish
//


// **************************************************************
// Create App List
// **************************************************************


var pubnubAppList = new AppList();



// **************************************************************
// Create AppList Collection View
// **************************************************************
var PubnubAppListView = Backbone.CollectionView.extend({
    classID: "View.AppList [AppListView]",
    el: $("ul#nav-pubnub-app-list"),
    collection: pubnubAppList,
    selectable: true,
    processKeyEvents: false,
    modelView: AppView,
    // Clear the css, remove the views, and unset selected channel
    clear_collection: function(){

        this.viewManager.each(function(view) {
            view.remove();
        });
        if (this.collection || this.getSelectedModel()) {
            this.setSelectedModel(null);
        }
    },
    // Empty collections that depend on what channel is selected (ChannelList, MessageList and PresenceList)
    reset: function() {
        this.clear_collection();
        pubnubKeysListView.assign_collection(null);
        pubnubKeysListView.clear_collection();
        pubnubChannelListView.clear_collection();
        pubnubMessageListView.clear_collection();
        pubnubPresenceListView.clear_collection();
    }
});

// Create Instance of PubnubKeysListView
var pubnubAppListView = new PubnubAppListView();


pubnubAppListView.on( "selectionChanged", function(newModel, oldModel) {
    var selectedApp = pubnubAppListView.getSelectedModel();

    if (selectedApp) {
        var klist = selectedApp.get("appKeys");
        pubnubKeysListView.assign_collection(klist);

        DC.LocalStore.app(selectedApp.get("name"));
    }

    DC.App.activateStreamMessageData();
});

// Render the App List
pubnubAppListView.render();




// **************************************************************
// Create KeysList Collection View
// **************************************************************
var PubnubKeysListView = Backbone.CollectionView.extend({
    classID: "View.KeysList [KeysListView]",
    el: $("ul#nav-pubnub-keys-list"),
    collection: null,
    selectable: true,
    processKeyEvents: false,
    modelView: KeysView,
    // Clear out css for selected AppKeys (just to ensure it's cleared in race conditions of fast swapping Apps, etc.)
    _reset_css: function() {
        // Make sure connected css is not present (will be auto-added on click)
        this.$el.find("li.connected").removeClass("connected");
    },
    // Prior to Swapping App, disconnect previously connected AppKeys (from previously selected app)
    _disconnect_all_keys: function() {
        if (this.collection != null) {
            this.collection.forEach(function(appKeys) {
                appKeys.disconnect();
            });
        }
    },
    // Assign a new collection to render
    // (disconnect previous, clear views, clear dependents, assign collection, render, reset css again (just in case))
    assign_collection: function(c){
        this._disconnect_all_keys();
        this.clear_collection();
        this.clear_dependent_collections();
        if (c != null) {
            this.setOption("collection", c);
            this.render();
            this._reset_css();
        }

    },
    // Clear the css, remove the views, and unset selected channel
    clear_collection: function(){
        this._reset_css();
        this.viewManager.each(function(view) {
            view.remove();
        });
        if (this.collection || this.getSelectedModel()) {
            this.setSelectedModel(null);
        }
    },
    // Empty collections that depend on what channel is selected (ChannelList, MessageList and PresenceList)
    clear_dependent_collections: function() {
        pubnubFullChannelListView.clear_collection();
        pubnubFullChannelList.reset();
        pubnubChannelListView.clear_collection();
        pubnubMessageListView.clear_collection();
        pubnubHistoryListView.clear_collection();
        pubnubPresenceListView.clear_collection();
    }

});

// Create Instance of PubnubKeysListView
var pubnubKeysListView = new PubnubKeysListView();


// When a AppKey set is changed, connect to Pubnub, assign ChannelList the associated channels for selected AppKey
pubnubKeysListView.on( "selectionChanged", function() {
    var selectedKeys = pubnubKeysListView.getSelectedModel();

    if (selectedKeys) {
        // Connect selected AppKeys to Pubnub
        selectedKeys.connect();

        // Update the list of Channels for this selected AppKeys
        var clist = selectedKeys.get("channels");

        pubnubChannelListView.assign_collection(clist);

        if (DC.retrieveChannelInterval > 0) {
            clearInterval(DC.retrieveChannelInterval);
        }

        pubnubFullChannelList.retrieve_channels(selectedKeys.get("subkey"));
        pubnubFullChannelListView.assign_collection(pubnubFullChannelList);

//        DC.retrieveChannelInterval = setInterval(function() {
//            pubnubFullChannelList.retrieve_channels(selectedKeys.get("subkey"));
//        }, 5000);

        setTimeout(function(){
            $("#link-view-all-channels").removeClass("hidden");
        }, 100);

        DC.LocalStore.app_keys(selectedKeys.get("name"));
    }
    else {
        console.log("why here");
        $("#link-view-all-channels").addClass("hidden");
    }

    DC.App.activateStreamMessageData();
});




// **************************************************************
// Create ChannelList Collection View
// **************************************************************
var PubnubChannelListView = Backbone.CollectionView.extend({
    classID: "View.KeysList [KeysListView]",
    el: $("ul#nav-pubnub-channel-list"),
    collection: null,
    selectable: true,
    processKeyEvents: false,
    modelView: ChannelView,
    // Clear out css for selected channels (just to ensure it's cleared in race conditions of fast swapping App/AppKeys, etc.)
    _reset_css: function() {
        this.$el.find("li.selected").removeClass("selected");
    },
    // Assign a new collection to render (unwatch current channels, clear the collection, clear dependents, assign the collection, render, and reset css (just in case)
    assign_collection: function(c){
        this.unwatch_channels();
        this.clear_collection();
        this.clear_dependent_collections();
        this.setOption("collection", c);
        if (c != null) {
            this.collection.on('sort', this.render, this);
            this.render();
            this._reset_css();
        }
    },
    // Clear the css, remove the views, and unset selected channel
    clear_collection: function(){
        this._reset_css();

        this.viewManager.each(function(view) {
            view.remove();
        });

        if (this.collection || this.getSelectedModel()) {
            this.setSelectedModel(null);
        }
    },
    // Unwatch channels when switching App or AppKeys
    unwatch_channels: function(unselect) {
      if (this.collection) {
          this.collection.forEach(function(m){
              m.unwatch();
          });
      }
      if (unselect) {
          if (this.collection || this.getSelectedModel()) {
              this.setSelectedModel(null);
          }
      }
    },
    // Empty collections that depend on what channel is selected (MessageList and PresenceList)
    clear_dependent_collections: function() {
        pubnubMessageListView.clear_collection();
        pubnubHistoryListView.clear_collection();
        pubnubPresenceListView.clear_collection();
    }
});


// Create instance of PubnubChannelListView
var pubnubChannelListView = new PubnubChannelListView();

// When a Channel is changed, subscribe and set watching, if not already subscribed, and indicate watching,
// unwatch any previous channels (but don't unsubscribe them)
pubnubChannelListView.on( "selectionChanged", function(newModel, oldModel) {
    var selectedChannel = pubnubChannelListView.getSelectedModel();

    if (selectedChannel) {

        // Unwatch the previously watch channel (if there is one)
        if (oldModel.length > 0 && !oldModel[0].get("isNavLink")) {
            oldModel[0].unwatch();
        }

        if (selectedChannel.get("isNavLink")) {
            DC.App.activateFullChannelList();
            pubnubFullChannelList.retrieve_channels();
            pubnubFullChannelListView.reset_selection();
        }
        else {

            // Subscribe to new if not already subscribed, otherwise just set watching
            if (!selectedChannel.get("subscribed")) {
                pubnubKeysListView.getSelectedModel().subscribe_channel(selectedChannel.get("name"), function () {
                    selectedChannel.watch();
                });
            }
            else {
                selectedChannel.watch();
            }

            // Clear out MessageList and assign collection by creating instance
            // (Marionette is different than CollectionView, reassigning collection doesn't reset listenTo events)
            var mlist = selectedChannel.get("messages");
            pubnubMessageListView.clear_collection();
            pubnubMessageListView = new PubnubMessageListView({
                collection: mlist
            }).render();

            var hlist = selectedChannel.get("history");
            pubnubHistoryListView = new PubnubHistoryListView({
                collection: hlist
            }).render();

            // Clear out PresenceList and assign collection by creating instance
            // (Marionette is different than CollectionView, reassigning collection doesn't reset listenTo events)
            var plist = selectedChannel.get("presence");
            pubnubPresenceListView.clear_collection();
            pubnubPresenceListView = new PubnubPresenceListView({
                collection: plist
            }).render();

            DC.App.activateStreamMessageData();
            //DC.resumeDataStreamScroll();
        }

        DC.LocalStore.channel(selectedChannel.get("name"));
    }

});





// **************************************************************
// Create MessageList Collection View
// **************************************************************
var PubnubMessageListView = Backbone.Marionette.CollectionView.extend({
    classID: "View.MessageList [MessageListView]",
    el: function() {
        // Since we destroy and recreate this view (more common with the Marionette version), conditionally re-add the binding element
        if (!$("#pubnub-message-list").length) {
            $("#panel-stream-message-data").append('<ul id="pubnub-message-list" class="data-list">');
        }
        return $("ul#pubnub-message-list");
    },
    childView: MessageView,
    initialize: function() {
        // Clear out any sample data
        this.$el.find("li.msg-item").remove();
    },
    // Before adding a child, check the current scroll point of the overflow-ul-pane
    onBeforeAddChild: function() {
        DC.checkScroll();
    },
    // After adding a child view, auto-scroll to bottom if we were scrolled to the bottom
    onAddChild: function() {
        setTimeout(function() { DC.autoScroll()}, 100);
    },
    clear_collection: function() {
        this.destroy();
    }

});

// Create instance of PubnubMessageListView
var pubnubMessageListView = new PubnubMessageListView();


// **************************************************************
// Create HistoryList Collection View
// **************************************************************
var PubnubHistoryListView = Backbone.Marionette.CollectionView.extend({
    classID: "View.MessageList [MessageListView]",
    el: function() {
        // Since we destroy and recreate this view (more common with the Marionette version), conditionally re-add the binding element
        if (!$("#pubnub-history-list").length) {
            $("#panel-history-explorer").append('<ul id="pubnub-history-list" class="data-list">');
        }
        return $("ul#pubnub-history-list");
    },
    childView: MessageView,
    initialize: function() {
        // Clear out any sample data
        this.$el.find("li.msg-item").remove();
    },
    clear_collection: function() {
        this.destroy();
    }

});

// Create instance of PubnubMessageListView
var pubnubHistoryListView = new PubnubHistoryListView();




// **************************************************************
// Create PresenceList Collection View
// **************************************************************
var PubnubPresenceListView = Backbone.Marionette.CollectionView.extend({
    classID: "View.PresenceList [PresenceListView]",
    el: function() {
        // Since we destroy and recreate this view (more common with the Marionette version), conditionally re-add the binding element
        if (!$("#pubnub-presence-list").length) {
            $("#stream-presence-data").append('<ul id="pubnub-presence-list" class="data-list">');
        }
        return $("ul#pubnub-presence-list");
    },
    childView: PresenceView,
    initialize: function() {
        // Clear out any sample data
        this.$el.find("li.presence-item-container").remove();
    },
    clear_collection: function() {
        this.destroy();
    }
});


// Create instance of PubnubPresenceListView
var pubnubPresenceListView = new PubnubPresenceListView();




// **************************************************************
// Create ChannelList Collection View
// **************************************************************
var PubnubFullChannelListView = Backbone.CollectionView.extend({
    classID: "View.KeysList [KeysListView]",
    el: $("#full-channel-list"),
    collection: null,
    selectable: true,
    processKeyEvents: false,
    modelView: FullChannelItemView,
    // Clear out css for selected channels (just to ensure it's cleared in race conditions of fast swapping App/AppKeys, etc.)
    _reset_css: function() {
        //this.$el.find("tr.selected").removeClass("selected");
    },
    // Assign a new collection to render (unwatch current channels, clear the collection, clear dependents, assign the collection, render, and reset css (just in case)
    assign_collection: function(c){
        this.clear_collection();
        this.setOption("collection", c);
        if (c != null) {
            this.render();
            this._reset_css();
//            if (!this.$el.find("thead").length){
//                this.$el.prepend('<thead><tr><th data-sort-type="name">Name</th><th data-sort-type="occupants">Occupants</th></tr></thead>');
//            }
        }
    },
    // Clear the css, remove the views, and unset selected channel
    clear_collection: function(){
        this._reset_css();

        this.viewManager.each(function(view) {
            view.remove();
        });

        if (this.collection || this.getSelectedModel()) {
            this.setSelectedModel(null);
        }
    },
    reset_selection: function() {
        this._reset_css();
        this.setSelectedModel(null);
    }
});

// Create instance of PubnubChannelListView
var pubnubFullChannelListView = new PubnubFullChannelListView();

// When a Channel is changed, subscribe and set watching, if not already subscribed, and indicate watching,
// unwatch any previous channels (but don't unsubscribe them)
pubnubFullChannelListView.on( "selectionChanged", function(newModel, oldModel) {
    var selectedChannel = pubnubFullChannelListView.getSelectedModel();

    if (selectedChannel) {
        var selectedKeys = pubnubKeysListView.getSelectedModel();
        selectedKeys.add_channel(selectedChannel.get("name"), true);
        selectedChannel.set("subscribed", true);
    }
});