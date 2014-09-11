// requires nothing
//
// Message
// MessageView
// MessageList
//
//

// **************************************************************
// Layout Scheme
// **************************************************************

/*
 <li class="msg-item">
 <div class="msg-item-container">
 <div class="msg-item-info">
 <div class="msg-item-identity"></div>
 </div>
 <div class="msg-item-content"><pre>{
 <span class="key">"name":</span> <span class="string">"Scalabl3"</span>,
 <span class="key">"msg":</span> <span class="string">"What's Up Developer Console"</span>,
 <span class="key">"uuid":</span> <span class="string">"4cb4bbc5-5af3-49a7-b0f7-17c9140378ba"</span>,
 <span class="key">"favorite_colors":</span> [
 <span class="string">"red"</span>,
 <span class="string">"green"</span>,
 <span class="string">"blue"</span>
 ],
 <span class="key">"preferences":</span> {
 <span class="key">"tablet":</span> <span class="string">"iPad"</span>,
 <span class="key">"phone":</span> <span class="string">"iPhone"</span>,
 <span class="key">"papertowels":</span> <span class="string">"Viva"</span>,
 <span class="key">"foods":</span> {
 <span class="key">"sub":</span> <span class="string">"Philly Cheesesteak"</span>,
 <span class="key">"fruit":</span> <span class="string">"Pineapple"</span>,
 <span class="key">"cheese":</span> <span class="string">"Cheddar"</span>
 }
 }
 }</pre>                 </div>
 </div>
 </li>
 */

// **************************************************************
// Model: Pam
// **************************************************************
var Pam = Backbone.Model.extend({
    classID: "Model.Pam [Pam]",
    defaults: {
        isGlobal: false,
        channel: null,
        channel_presence: null,
        authkey: null,
        ttl: null,
        read: null,
        write: null,
        includePresence: false,
        hasContent: false,
        rendered: false
    }
});

// **************************************************************
// View: Message
// **************************************************************
var PamView = Backbone.View.extend({
    classID: "View.Pam [PamView]",
    tagName: 'li',
    className: 'pam-item clearfix',
    rawTemplate: '<div class="item-container">' +
        '{{#if isGlobal}}' +
            '<div class="item-info clearfix">' +
                '<div class="info-label">Global</div>' +
                '<div class="info-name"></div>' +
            '</div>' +
        '{{else}}' +
            '<div class="item-info clearfix">' +
                '<div class="info-label">Channel</div>' +
                '<div class="info-name">{{channel}}</div>' +
            '</div>' +
            '<div class="item-info clearfix">' +
                '<div class="info-label">AuthKey</div>' +
                '<div class="info-name">{{authkey}}</div>' +
            '</div>' +
        '{{/if}}' +
        '<div class="item-permissions clearfix open">' +
        '<div class="type-label"><i class="fa fa-clock-o"></i></div>' +
        '<div class="type-name">{{expires}}</div>' +
        '</div>' +
        '<div class="item-permissions clearfix {{#if read}}open{{else}}blocked{{/if}}">' +
            '<div class="type-label"><i class="fa {{#if read}}fa-check{{else}}fa-times{{/if}}"></i></div>' +
            '<div class="type-name">Read</div>' +
        '</div>' +
        '<div class="item-permissions clearfix {{#if write}}open{{else}}blocked{{/if}}">' +
            '<div class="type-label"><i class="fa {{#if write}}fa-check{{else}}fa-times{{/if}}"></i></div>' +
            '<div class="type-name">Write</div>' +
        '</div>' +
        '<div class="item-permissions clearfix {{#if includePresence}}open{{else}}blocked{{/if}}">' +
            '<div class="type-label"><i class="fa {{#if includePresence}}fa-check{{else}}fa-times{{/if}}"></i></div>' +
            '<div class="type-name">Presence {{#if channel_presence}}({{channel_presence}}){{/if}}</div>' +
        '</div>' +
        '{{#unless isGlobal}}<div class="item-permissions clearfix">' +
            '<div class="type-label"><button class="btn btn-xs btn-default">revoke</button></div>' +
        '</div>{{/unless}}' +
        '</div>',
    compiledTemplate: null,
    initialize: function () {
        //this.model.on('change', this.render, this);
        this.model.on('hide', this.remove, this);
        this.model.on('change:read change:write change:ttl change:includePresence', this.render, this);
        this.compiledTemplate = Handlebars.compile(this.rawTemplate);
    },
    update_state: function() {

        if (this.model.get("isGlobal")) {
            this.$el.addClass("global");
        }
        else {
            this.$el.removeClass("global");
        }
    },
    render: function () {
        //console.log(this.model.toJSON());
        if (this.model.get("hasContent")) {

            var attributes = this.model.toJSON();
            //console.log(attributes);
            if (attributes.ttl === 0) {
                attributes.expires = "Doesn't Expire";
            }
            else {
                attributes.expires = "Expires in " + attributes.ttl + (attributes.ttl > 1 ? " mins" : " min");
            }
            //console.log(attributes);
            this.$el.html(this.compiledTemplate(attributes));
            this.update_state();


            this.model.set("rendered", true);
        }
    }
});

// **************************************************************
// Collection: PamList (model: Pam)
// **************************************************************
var PamList = Backbone.Collection.extend({
    classID: "Collection.Pam [PamList]",
    model: Pam,
    initialize: function() {
        this.on('remove', this.hideModel);
    },
    hideModel: function(model){
        model.trigger('hide');
    }
});