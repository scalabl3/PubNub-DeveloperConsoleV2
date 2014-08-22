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
        app: null,
        name: "[NONE]",
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
        c.add({ name: "Add/View Channel List", navID: "link-view-all-channels", navIcon: "fa-list-alt", isNavLink: true, sortValue: "!" });
        //c.add({ name: "Add Channels...", navID: "link-add-channel", navIcon: "fa-plus", isNavLink: true, sortValue: "{" });
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
        var newChannel = null;

        if (!added) {
            newChannel = channels.add({appKeys: this, app: this.get("app"), name: name, sortValue: name.toLowerCase() });
            this.set("channels", channels);
            // Save current list of channels to local storage
            DC.LocalStore.channels(name);
        }
        if (subscribe) {
            this.subscribe_channel(name);
        }

        return newChannel;
    },
    remove_channel: function(name) {
        this.unsubscribe_channel(name);

        // Remove from ChannelList
        var channels = this.get("channels");
        channels.remove(channels.findWhere({name: name}));
        this.set("channels", channels);

        // Remove subscribed status from Full Channel List
        pubnubFullChannelList.set_unsubscribed(name);
        // Save current list of channels to local storage
        DC.LocalStore.channels(this.channel_names());
    },
    subscribe_channel: function(name, completeCallback){
        var self = this;
        var subChannel = this.attributes.channels.findWhere({name: name});
        if (!subChannel) {
            subChannel = this.add_channel(name);
        }
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
                                //console.log(herenow);
                                //subChannel.receive_presence(message);
                            }
                        });
                        if (_.isFunction(completeCallback)) {
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

            // Remove subscribed status from Full Channel List
            pubnubFullChannelList.set_unsubscribed(name);

            if (_.isFunction(completeCallback)) {
                completeCallback();
            }
        }
    },
    channel_names: function() {
        var clistAll = this.get("channels");
        var clist = clistAll.where({ isNavLink: false });
        if (!_.isEmpty(clist)) {
            var names = _.map(clist, function(c) { return c.get("name") });
            //console.log(names);
            return names;
        }
        else {
            return [];
        }
    },
    publish_message: function(ch, msg) {
        this.attributes.pubnub.publish({
            channel: ch,
            message: msg
        });
    },
    get_history: function(options) {

        var self = this;
        var subChannel = this.attributes.channels.findWhere({name: options.channel});
        options.include_token = true;

        var originalOptions = JSON.deepCopy(options);

        if (subChannel) {
            var hlist = subChannel.get("history");
            hlist.reset();

            function get_all_history(args) {
                var channel  = args.channel,
                    completeCallback = args.callback,
                    totalCount = args.count,
                    start = 0,
                    count = totalCount > 100 ? 100 : totalCount,
                    history  = [],
                    params   = {
                            channel  : channel,
                            count    : count,
                            include_token: true,
                            callback : function(messages) {
                                var msgs = messages[0];
                                start = messages[1];
                                params.start = start;


                                _.forEach(msgs, function(m) {
                                    history.push(m)
                                });

                                if (history.length >= totalCount) {
                                    return completeCallback(history);
                                } 
                                //console.log(totalCount - history.length);
                                if (totalCount - history.length > 100) {
                                    params.count = 100;
                                }
                                else {
                                    params.count = totalCount - history.length;
                                }
                                //console.log(count);

                                add_messages();
                            }
                    };

                add_messages();

                function add_messages() {
                    //console.log("add_messages", params.count);
                    self.attributes.pubnub.history(params)
                }
            }

            options.callback = function(messages) {
                _.forEach(messages, function(m){
                    var thisIndex = hlist.length + 1 || 1;
                    hlist.add({ displayIndex: thisIndex, timetoken: m.timetoken, content: m.message });
                });
                subChannel.set("history", hlist);
            };

            get_all_history(options);

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
    rawTemplate: '<a href="#"><i data-action="connect" class="fa fa-key"></i> <span>{{name}}</span></a><i data-action="edit" class="fa fa-users connected-status connected"></i>',
    compiledTemplate: null,

    initialize: function(){
        this.model.on('change', this.render, this);
        this.model.on('hide', this.remove, this);
        this.compiledTemplate = Handlebars.compile(this.rawTemplate);
    },

    toggle_active: function() { this.model.toggle_active(); },

    render: function() {
        debuglog.by("Render AppKeys - ", this.model.get("name"));
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
