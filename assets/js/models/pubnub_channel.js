// requires Message/MessageList
//
// Channel
// ChannelView
// ChannelList
//
//

// **************************************************************
// Layout Scheme
// **************************************************************

/*
<div class="nav-section">
    <span class="nav-section-title">SUBSCRIBED CHANNELS</span>
</div>
<ul class="nav nav-pubnub-channels">
    <li class="feature-link"><a href="#"><i class="fa fa-list-alt"></i> <span>View Channel List</span></a></li>
    <li class="channel subscribed watching">
        <a href="#"><i class="fa"></i> <span>dev_console</span></a>
    </li>
    <li class="channel subscribed">
        <a href="#"><i class="fa"></i> <span>my_other_channel</span></a>
    </li>
    <li class="channel unsubscribed">
        <a href="#"><i class="fa"></i> <span>my_channel</span></a>
    </li>
    <li class="feature-link"><a href="#"><i class="fa fa-plus"></i> <span>Subscribe to Channel...</span></a></li>
</ul>
*/

// **************************************************************
// Model: Channel
// **************************************************************
var Channel = Backbone.Model.extend({
    classID: "Model.Channel [Channel]",
    defaults: {
        app: null,
        appKeys: null,
        name: null,
        subscribed: false,
        watching: false,
        messagesReceived: 0,
        messagesDisplayed: 0,
        messagesNew: 0,
        occupants: 0,
        messages: null,
        history: null,
        presence: null,
        rendered: false,
        isNavLink: false,       // Special first item in collection used for viewing all channels (global_here_now)
        navID: "",
        sortValue: null
    },
    initialize: function() {
        var mlist = new MessageList({
            comparator: function(message) {
                return message.get("timetoken");
            }
        });
        this.set("messages", mlist);

        var hlist = new MessageList({
            comparator: function(message) {
                return message.get("timetoken");
            }
        });
        this.set("history", hlist);

        var plist = new PresenceList({
            comparator: function(message) {
                return -message.get("timestamp");
            }
        });
        this.set("presence", plist);
    },
    watch: function() {
      if (this.get("subscribed")) {
          this.set("watching", true);
      }
      else {
        console.log(this.get("name") + " - Watch: Not currently subscribed");
      }
    },
    unwatch: function() {
        this.set("watching", false);
    },
    clear_messages: function(){
        this.set("messages", null);
        var mlist = new MessageList({
            comparator: function(message) {
                return message.get("timetoken");
            }
        });
        this.set("messages", mlist);
    },
    receive_message: function(message, env, channel) {
        if (message) {
            var mlist = this.get("messages");
            mlist.add({ timetoken: env[1], content: message });

            // To Conserve Browser memory (if you leave the console open), max out number of messages that will be shown in window
            if (mlist.length > DC.maxMessages + 1) {
                mlist.shift();
            }

            this.set("messages", mlist);
            this.set("messagesReceived", this.get("messagesReceived") + 1);
            this.set("messagesDisplayed", mlist.length - 1);

            if (DC.autoScrollPaused) {
                this.set("messagesNew", this.get("messagesNew") + 1);
            }
            else {
                this.set("messagesNew", 0);
            }

            if (this.get("watching")) {
                DC.updateInfoBar({
                    messagesReceived: this.get("messagesReceived"),
                    messagesDisplayed: this.get("messagesDisplayed"),
                    messagesNew: this.get("messagesNew")
                });
            }
        }
    },
    receive_presence: function(message) {
        if (message.uuid != null && typeof message.uuid != 'undefined') {
            //console.log(message);
            var plist = this.get("presence");
            var p = new Presence({ timestamp: message.timestamp, uuid: message.uuid, action: message.action, occupants: message.occupancy });
            //console.log(p);
            plist.unshift(p);

            // To Conserve Browser memory (if you leave the console open), max out number of messages that will be shown in window
            if (plist.length > DC.maxMessages) {
                mlist.pop();
            }

            DC.App.updatePanelHeaderPresence(message.occupancy);

            this.set("presence", plist);
            this.set("occupants", message.occupancy);
        }
    }
});

// **************************************************************
// View: Channel
//  * contains MessageList and PresenceList
// **************************************************************
var ChannelView = Backbone.View.extend({
    classID: "View.Channel [ChannelView]",
    tagName: 'li',
    className: 'channel',
    rawTemplate: '<a href="#"><i class="fa"></i> <span>{{name}}</span></a></i> <div class="">' +
        '<i data-action="messages" data-value="{{name}}" class="action action-messages fa fa-list-ul clickable" data-toggle="tooltip" data-placement="bottom" data-animation="false" data-delay="0" title="Message Stream"></i> ' +
        '<i data-action="history" data-value="{{name}}" class="action action-history fa fa-history clickable" data-toggle="tooltip" data-placement="bottom" data-animation="false" data-delay="0" title="Explore History"></i> ' +
        '<i data-action="pam" data-value="{{name}}" class="action action-pam fa fa-user clickable" data-toggle="tooltip" data-placement="bottom" data-animation="false" data-delay="0" title="Manage Access"></i> ' +
        '<i data-action="unsubscribe" data-value="{{name}}" class="action action-unsub fa fa-circle-o clickable" data-toggle="tooltip" data-placement="bottom" title="Unsubscribe"></i> ' +
        '<i data-action="remove" data-value="{{name}}" class="action action-remove fa fa-times-circle clickable" data-toggle="tooltip" data-placement="bottom" title="Remove From List"></i>' +
        '</div>',
    navLinkTemplate: '<a id="{{navID}}" href="#"><i class="fa {{navIcon}}"></i> <span>{{name}}</span></a>',
    compiledTemplate: null,

    initialize: function () {
        this.model.on('change:name change:subscribed change:watching', function(a,b,c){
            var changedKey = _.first(_.keys(a.changed));
            var changedKV = {};
            changedKV[changedKey] = a.previousAttributes()[changedKey];
            debuglog.gw("FROM: ", JSON.stringify(changedKV), " TO ", JSON.stringify(a.changed));
            this.render();
        }, this);
        this.model.on('hide', this.remove, this);
        this.compiledTemplate = Handlebars.compile(this.rawTemplate);
        this.compiledNavTemplate = Handlebars.compile(this.navLinkTemplate);
    },
    events: {

        "click .action-messages": 'do_messages',
        "click .action-pam"     : 'do_pam',
        "click .action-history" : 'do_history',
        "click .action-remove"  : 'do_remove',
        "click .action-unsub"   : 'do_unsub',
        "mouseenter .action"    : "tooltip_show",
        "mouseleave .action"    : "tooltip_hide"
    },
    tooltip_show: function(e,f) {
        $(e.target).tooltip('show');
    },
    tooltip_hide: function(e) {
        $(e.target).tooltip('hide');
    },
    do_messages: function() {
        DC.App.activateStreamMessageData();
    },
    do_history: function() {
        DC.App.activateHistoryExplorer();
    },
    do_pam: function() {
        DC.App.activatePAM();
    },
    do_remove: function() {
        var keys = this.model.get("keys");
        if (keys) {
            keys.remove_channel(this.model.get("name"));
        }
    },
    do_unsub: function() {
        var keys = this.model.get("keys");
        if (keys) {
            if (this.model.get("subscribed")) {
                keys.unsubscribe_channel(this.model.get("name"));
                pubnubChannelListView.setSelectedModel(null);
            }
            else {
                keys.subscribe_channel(this.model.get("name"));
            }
        }
    },
    update_state: function() {


            if (this.model.get("subscribed")) {
                this.$el.addClass("subscribed");
                this.$el.removeClass("unsubscribed");
            }
            else {
                this.$el.addClass("unsubscribed");
                this.$el.removeClass("subscribed");
            }

            if (this.model.get("watching")) {
                this.$el.addClass("watching");
            }
            else {
                this.$el.removeClass("watching");
            }

    },
    render: function() {
        debuglog.by("Render Channel - ", this.model.get("name"));
        var attributes = this.model.toJSON();

        if (!this.model.get("isNavLink")) {
            this.$el.html(this.compiledTemplate(attributes));
            this.update_state();
        }
        else {
            this.$el.html(this.compiledNavTemplate(attributes));
            this.$el.addClass("nav-link");
            this.$el.removeClass("channel");
        }
        this.model.set("rendered", true);
    }
});

// **************************************************************
// Collection: ChannelList (model: Channel)
// **************************************************************
var ChannelList = Backbone.Collection.extend({
    classID: "Collection.Channel [ChannelList]",
    model: Channel,
    comparator: 'sortValue',
    initialize: function() {
        this.on('remove', this.hideModel);
    },
    hideModel: function(model){
        model.trigger('hide');
    }
});

