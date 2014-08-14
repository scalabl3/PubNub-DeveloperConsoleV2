



var FullChannelListItem = Backbone.Model.extend({
   defaults: {
       name: null,
       occupants: null
   }
});

// **************************************************************
// View: App
// **************************************************************
var FullChannelItemView = Backbone.View.extend({
    classID: "View.FullChannelListItem [FullChannelListItem]",
    tagName: 'tr',
    className: 'channel-list-item',
    rawTemplate: '<td><i class="fa"></i><span>{{name}}</span></td><td><span>{{occupants}}</span></td>',
    compiledTemplate: null,
    initialize: function(){
        //this.model.on('change', this.render, this);
        this.compiledTemplate = Handlebars.compile(this.rawTemplate);
    },
    render: function() {
        if (this.model.get("name") !== null) {
            //console.log("AppView render");
            var attributes = this.model.toJSON();
            //var compiledTemplate = Handlebars.compile(this.rawTemplate);
            this.$el.html(this.compiledTemplate(attributes));
        }
    }
});

// **************************************************************
// Collection: FullChannelList (model: FullChannelItem)
// **************************************************************
var FullChannelList = Backbone.Collection.extend({
    classID: "Collection.FullChannelItem [FullChannelItem]",
    model: FullChannelListItem,
    subscribeKey: null,
    channels: null,
    filtered: null,
    totalChannels: null,
    totalOccupancy: null,
    retrieve_channels: function(subscribeKey) {

        if (subscribeKey) {
            this.subscribeKey = subscribeKey;
            this.reset();
        }

        var url_global_here_now = "http://pubsub.pubnub.com/v2/presence/sub-key/" + this.subscribeKey + "?disable_uuids=1";

        var clist = this;

        $.ajax({
            url: url_global_here_now, datatype: "json",
            beforeSend: function( xhr ) { xhr.overrideMimeType( "application/json" ); }
        }).done(function( data ) {

            if (data.payload.channels) {
                console.log("PN: retrieved full subscribed channel list");
                //console.log(data.payload);

                clist.totalChannels =  data.payload.total_channels;
                clist.totalOccupancy =  data.payload.total_occupancy;
                clist.channels =  data.payload.channels;
                clist.filtered =  data.payload.channels;

                $.each(data.payload.channels, function (c, v) {

                    var ch = clist.findWhere({name: c});

                    // If channel listed already, update occupants only, otherwise add it to list
                    if (ch) {
                        ch.set("occupants", v.occupancy);
                    }
                    else {
                        clist.add(new FullChannelListItem({ name: c, occupants: v.occupancy }))
                    }
                });
            }
        });
    }
});

var pubnubFullChannelList = new FullChannelList();
