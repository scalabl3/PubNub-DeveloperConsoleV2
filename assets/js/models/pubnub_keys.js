// requires Channel/ChannelList
//
// Keys
// KeysView
// KeysList
// KeysListView
//
//

// **************************************************************
// Layout Scheme
// **************************************************************

/*
<div class="nav-section">
    <span class="nav-section-title">APP KEYS<!-- [<span class="nav-selected-app-name">DEMO</span>]--></span>
</div>
<ul id="pubnub-keys-list" class="nav nav-pubnub-keys">
    <li class="keys active">
        <a href="#"><i class="fa fa-key"></i> <span>Sandbox</span></a>
        <i class="fa fa-cog connected-status connected"></i>
    </li>
    <li class="keys">
    <a href="#"><i class="fa fa-key"></i> <span>Production</span></a>
    <i class="fa fa-cog connected-status"></i>
</li>
    <li class="feature-link"><a href="#"><i class="fa fa-plus"></i> <span>Add App Keys...</span></a></li>
</ul>
*/

// **************************************************************
// Model: Keys
//  * contains ChannelList
// **************************************************************
var Keys = Backbone.Model.extend({
    classID: "Model.Keys [Keys]",
    defaults: {
        appName: "not set",
        name: "undefined",
        pubkey: "",
        subkey: "",
        secretKey: "",
        useSSL: false,
        usePresence: true,
        useHistory: true,
        isConnected: false,
        isActive: false,
        pubnub: null,
        channels: null,
        enabled: false,
        hasPresence: false,
        hasHistory: false,
        hasPAM: false,
        hasMultiplex: false,
        hasAnalytics: false,
        hasApplePush: false
    },
    initialize: function() {
        var c = new ChannelList();
        // Add Default Nav View Channel List using global_here_now as first "channel" item
        c.add({ name: "View Channel List", isViewChannels: true });
        this.set("channels", c);
    },
    connect: function() {
        if (!this.get("isConnected")) {
            console.log ("PN: connecting " + this.get("appName") + "::" + this.get("name"));
            this.set("pubnub", PUBNUB.init({
                publish_key	 : this.get("pubkey"),
                subscribe_key : this.get("subkey"),
                uuid: "pubnub-developer-console",
                ssl: true
            }));
        }
        else {
            //console.log ("PUBNUB: already connected to " + this.get("appName") + "::" + this.get("name"));
        }
        this.set("isConnected", true);
    },
    disconnect: function() {
        if (this.get("isConnected")) {
            console.log ("PN: disconnecting " + this.get("appName") + "::" + this.get("name"));
        }
        var clist = this.get("channels");
        var cnames = clist.pluck("name");
        //console.log(cnames);
        var thisObj = this;

        $.each(cnames, function(i,v){
           thisObj.unsubscribe_channel(v);
        });

        this.set("pubnub", null);
        this.set('isConnected', false)
    },
    add_channel: function(name, subscribe) {
        subscribe = typeof subscribe !== 'undefined' ? subscribe : false;

        // Add Channel to ChannelList
        var channels = this.get("channels");
        var added = this.attributes.channels.findWhere({name: name});
        if (!added) {
            channels.add({name: name});
            this.set("channels", channels);
        }
        if (subscribe) {
            this.subscribe_channel(name);
        }
    },
    remove_channel: function(name) {
        this.unsubscribe_channel(name);

        // Remove from ChannelList
        var channels = this.get("channels");
        channels.remove(channels.findWhere({name: name}));
        this.set("channels", channels);
    },
    subscribe_channel: function(name, completeCallback){
        var self = this;
        var subChannel = this.attributes.channels.findWhere({name: name});
        if (subChannel) {
            if (!subChannel.get("subscribed")) {
                console.log("\tPN: subscribing to " + name);
                this.attributes.pubnub.subscribe({
                    channel: subChannel.get("name"),
                    message: function (message, env, channel) {
                        subChannel.receive_message(message, env, channel);
                    },
                    presence: function (message) {
                        //console.log(message);
                        subChannel.receive_presence(message);
                    },
                    connect: function () {
                        subChannel.set("subscribed", true);
                        self.attributes.pubnub.here_now({
                            channel: subChannel.get("name"),
                            callback: function(herenow) {
                                console.log(herenow);
                                //subChannel.receive_presence(message);
                            }
                        });
                        if (completeCallback && typeof(completeCallback) == "function") {
                            completeCallback();
                        }
                    }
                });
            }
        }
    },
    unsubscribe_channel: function(name, completeCallback) {
        var unsubChannel = this.attributes.channels.findWhere({name: name});
        if (unsubChannel && unsubChannel.get("subscribed")) {
            console.log("\tPN: unsubscribing to " + name);
            if (this.attributes.pubnub){
                this.attributes.pubnub.unsubscribe({ channel: name });
            }
            unsubChannel.set("subscribed", false);
            unsubChannel.set("watching", false);
            unsubChannel.clear_messages();

            if (completeCallback && typeof(completeCallback) == "function") {
                completeCallback();
            }
        }
    },
    toggle_active: function() {
        if (this.get("active")) {
            this.set("active", false);
        }
        else {
            this.set("active", true);
        }
    }
});

// **************************************************************
// View: Keys
// **************************************************************
var KeysView = Backbone.View.extend({
    classID: "View.Keys [KeysView]",
    tagName: 'li',
    className: 'keys',
    rawTemplate: '<a href="#"><i data-action="connect" class="fa fa-key"></i> <span>{{name}}</span></a><i data-action="edit" class="fa fa-cog connected-status connected"></i>',
    compiledTemplate: null,

    initialize: function(){
        this.model.on('change', this.render, this);
        this.model.on('hide', this.remove, this);
        this.compiledTemplate = Handlebars.compile(this.rawTemplate);
    },

    toggle_active: function() { this.model.toggle_active(); },

    render: function() {
        var attributes = this.model.toJSON();
        this.$el.html(this.compiledTemplate(attributes));

        // if current selected/active add this class to the outer li
        if (this.model.get("active")) {
            this.$el.addClass("active");
        }
        else {
            this.$el.removeClass("active");
        }

        // if connected, add connected class to last icon
        if (this.model.get("isConnected")) {
            this.$el.addClass("connected");
        }
        else {
            this.$el.removeClass("connected")
        }

    }
});

// **************************************************************
// Collection: KeysList (model: Keys)
// **************************************************************
var KeysList = Backbone.Collection.extend({
    classID: "Collection.Keys [KeysList]",
    model: Keys,
    initialize: function() {
        this.on('remove', this.hideModel);
    },
    hideModel: function(model){
        model.trigger('hide');
    }
});

//// **************************************************************
//// Collection View: KeysListView
//// **************************************************************
//var KeysListView = Backbone.View.extend({
//    el: $("#pubnub-keys-list"),
//    initialize: function(){
//        this.collection.on('add', this.addOne, this);
//
//    },
//    render: function() {
//        this.collection.forEach(this.addOne, this);
//    },
//    addOne: function(modelItem) {
//        var modelView = new AppView({ model: modelItem });
//        modelView.render();
//        this.$el.append(modelView.el);
//    }
//});
