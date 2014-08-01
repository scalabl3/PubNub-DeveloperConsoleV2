// requires nothing
//
// Presence
// PresenceView
// PresenceList
//
//

// **************************************************************
// Layout Scheme
// **************************************************************

/*
<li class="presence-item-container">
    <div class="presence-item-info clearfix">
        <div class="presence-item-identity">Sun Oct 16, 2011 09:17:56.721</div>
    </div>
    <div class="presence-item-content clearfix">
        <div class="presence-occupants">+7 [9]</div>
        <div class="presence-uuids"><pre><span class="string">"3a13460b-5761-4ac7-ab6c-99d543566faf"</span>,
            <span class="string">"6d82400d-1d16-4ea9-88cb-520e66c78909"</span>,
            <span class="string">"6d82400d-1d16-4ea9-88cb-520e66c78909"</span>,
            <span class="string">"6d82400d-1d16-4ea9-88cb-520e66c78909"</span>,
            <span class="string">"6d82400d-1d16-4ea9-88cb-520e66c78909"</span>,
            <span class="string">"6d82400d-1d16-4ea9-88cb-520e66c78909"</span>
        </pre></div>
    </div>
</li>
*/

// **************************************************************
// Model: Presence
// **************************************************************
var Presence = Backbone.Model.extend({
    classID: "Model.Presence [Presence]",
    defaults: {
        timestamp: null,
        timestampFormatted: null,
        rendered: false,
        collapsed: false,
        uuid: null,
        action: null,
        occupants: 0
    },
    initialize: function() {
        this.set("timestampFormatted", this.format_timetoken(this.get("timestamp")));
    },
    format_timetoken: function(tt) {
        var divisor = 1;
        return moment.unix(tt / divisor).format('ddd MMM DD, YYYY HH:mm:ss.SSS');
    }
});

// **************************************************************
// View: Presence
// **************************************************************
var PresenceView = Backbone.View.extend({
    classID: "View.Presence [PresenceView]",
    tagName: 'li',
    className: 'presence-item-container',
    rawTemplate: '<div class="presence-item-info clearfix"><div class="presence-item-identity">{{timestampFormatted}}</div></div><div class="presence-item-content clearfix"><div class="presence-occupants">{{action}} [now: {{occupants}}]</div><div class="presence-uuids"><pre><span class="string">{{uuid}}</span></pre></div></div>',
    compiledTemplate: null,
    initialize: function () {
        this.model.on('change', this.render, this);
        this.model.on('hide', this.remove, this);
        this.compiledTemplate = Handlebars.compile(this.rawTemplate);
    },
    render: function() {
        if (this.model.get("uuid")) {
            var attributes = this.model.toJSON();
            this.$el.html(this.compiledTemplate(attributes));
            this.model.set("rendered", true);
        }
    }
});

// **************************************************************
// Collection: PresenceList (model: Presence)
// **************************************************************
var PresenceList = Backbone.Collection.extend({
    classID: "Collection.Presence [PresenceList]",
    model: Presence,
    initialize: function() {
        this.on('remove', this.hideModel);
    },
    hideModel: function(model){
        model.trigger('hide');
    }
});

