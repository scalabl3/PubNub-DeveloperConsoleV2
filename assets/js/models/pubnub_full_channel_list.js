



var FullChannelListItem = Backbone.Model.extend({
   defaults: {
       name: null,
       occupants: null,
       subscribed: false
   }
});

// **************************************************************
// View: FullChannelItem
// **************************************************************
var FullChannelItemView = Backbone.View.extend({
    classID: "View.FullChannelListItem [FullChannelListItem]",
    tagName: 'li',
    className: 'channel-list-item cleartext',
    rawTemplate: '<div class="subscribed" data-subscribed="{{subscribed}}">{{#if subscribed}}<i class="fa fa-dot-circle-o"></i>{{else}}<i class="fa fa-circle-o"></i>{{/if}}</div><div class="name">{{name}}</div><div class="occupants">{{occupants}}</div>',
    compiledTemplate: null,
//    attributes: function() {
//        return {
//            'data-channel-name': this.model.get("name"),
//            'data-channel-occupants': this.model.get("occupants")
//        }
//    },
    initialize: function(){
        this.model.on('change', this.render, this);
        this.compiledTemplate = Handlebars.compile(this.rawTemplate);
    },
    render: function() {
        if (this.model.get("name") !== null && this.model.get("name").length > 0) {
            //console.log("AppView render");
            var attributes = this.model.toJSON();
            //var compiledTemplate = Handlebars.compile(this.rawTemplate);
            this.$el.html(this.compiledTemplate(attributes));
            if (this.model.get("subscribed")) {
                this.$el.addClass("subscribed");
            }
            else {
                this.$el.removeClass("subscribed");
            }
        }
        else {
            this.$el.remove();
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
    initialize: function() {

    },
    set_unsubscribed: function(name) {
        if (!_.isEmpty(this.models)) {
            var c = this.findWhere({ name: name });
            if (!_.isUndefined(c)) {
                c.set("subscribed", false);
            }
        }
    },
    highlight_subscribed: function() {
        var keys = pubnubKeysListView.getSelectedModel();

        var self = this;

        if (keys) {
            var cnames = keys.channel_names();

            _.forEach(cnames, function(n){
                var item = self.findWhere({name: n});
                if (item) {
                    item.set("subscribed", true);
                }
            });
        }
        $("#full-channel-list li").each(function(){
            $(this).removeClass('cleartext');
        });
    },
    retrieve_channels: function(subscribeKey) {

        if (subscribeKey) {
            this.subscribeKey = subscribeKey;
            this.reset();
        }

        var url_global_here_now = "http://pubsub.pubnub.com/v2/presence/sub-key/" + this.subscribeKey + "?disable_uuids=1";

        var self = this;

        $.ajax({
            url: url_global_here_now, datatype: "json",
            beforeSend: function( xhr ) { xhr.overrideMimeType( "application/json" ); }
        }).done(function( data ) {

            if (data.payload.channels) {
                console.log("PN: retrieved full subscribed channel list");
                //console.log(data.payload);

                self.totalChannels =  data.payload.total_channels;

                self.totalOccupancy =  data.payload.total_occupancy;
                self.channels =  data.payload.channels;
                self.filtered =  data.payload.channels;

                $.each(data.payload.channels, function (c, v) {

                    var ch = self.findWhere({name: c});

                    // If current_channel listed already, update occupants only, otherwise add it to list
                    if (ch) {
                        ch.set("occupants", v.occupancy);
                    }
                    else {
                        self.add(new FullChannelListItem({ name: c, occupants: v.occupancy }))
                    }
                });

                $("#channel-count").text("[" + data.payload.total_channels + "]");

                setTimeout(function(){

                        if (DC.isotopeActive) {
                            $("#full-channel-list").isotope('appended', $("#full-channel-list li:not([style])")).isotope('reloadItems');
                        }

                        $("#full-channel-list").isotope({
                            itemSelector: '.channel-list-item',
                            getSortData: {
                                name: '.name',
                                occupants: function( itemElem ) { // function
                                    var occupants = $( itemElem ).find('.occupants').text();
                                    return parseInt(occupants);
                                },
                                subscribed: function( itemElem ) {
                                    var subscribed = $( itemElem ).find('.subscribed').attr("data-subscribed");
                                    return subscribed === "true" ? "1" : "2";
                                }
                            },
                            sortBy: DC.isotopeSort,
                            sortAscending: {
                                name: true,
                                occupants: false,
                                subscribed: true
                            },
                            vertical: {
                                horizontalAlignment: 0.5
                            }
                        }).isotope('on','layoutComplete', function(){
                            //console.log("layout-complete");
                            self.highlight_subscribed();
                        });
                        //console.log('layout...')
                        $("#full-channel-list").isotope().isotope('reloadItems');

                        DC.isotopeActive = true;




                }, 100);

            }
        });
    }
});

var pubnubFullChannelList = new FullChannelList();
