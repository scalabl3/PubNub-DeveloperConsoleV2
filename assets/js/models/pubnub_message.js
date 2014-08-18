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
            <div class="msg-item-identity" id="test"></div>
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
// Model: Message
// **************************************************************
var Message = Backbone.Model.extend({
    classID: "Model.Message [Message]",
    defaults: {
        timetoken: null,
        rendered: false,
        collapsed: false,
        content: null
    },
    initialize: function() {

    }
});

// **************************************************************
// View: Message
// **************************************************************
var MessageView = Backbone.View.extend({
    classID: "View.Message [MessageView]",
    tagName: 'li',
    className: 'msg-item',
    rawTemplate: '<div class="msg-item-container"><div class="msg-item-info"><div class="msg-item-identity" id="test">{{timestamp}}</div></div><div class="msg-item-content">{{{content}}}</div></div>',
    compiledTemplate: null,
    renderContent: {
        timetoken: null,
        timestamp: null,
        content: null
    },
    initialize: function () {
        this.model.on('change', this.render, this);
        this.model.on('hide', this.remove, this);
        this.compiledTemplate = Handlebars.compile(this.rawTemplate);
    },
    render: function() {
        if (this.model.get("content")) {
            this.create_render_content();
            this.$el.html(this.compiledTemplate(this.renderContent));
            this.$el.find("div.msg-item-container").mouseover(function(){
                DC.isWatchingMessage = true;
            }).mouseout(function(){
                DC.isWatchingMessage = false;
            });
            this.model.set("rendered", true);
        }
    },
    create_render_content: function() {
        this.renderContent.timetoken = this.model.get("timetoken");
        this.renderContent.timestamp = this.format_timetoken(this.model.get("timetoken"));
        this.renderContent.content = this.render_json(this.model.get("content"));
    },
    format_timetoken: function(tt) {
        var divisor = 10000000.0;
        return moment.unix(tt / divisor).format('ddd MMM DD, YYYY HH:mm:ss.SSS');
    },
    render_json: function (data) {

        var html = "";
        var prettified = "";

        try {
            if (typeof data == "string") {
                prettified  = JSON.stringify(JSON.parse(data),null,2);
            }
            else {
                prettified  = JSON.stringify(data,null,2);
            }
            var highlighted = this.syntaxHighlight(prettified);
            html = ("<pre>" + highlighted + "</pre>");
        }
        // if parse or stringify fail, output content as a string
        catch (err) {
            console.log(err);
            html = "<pre><span class=\"string\">" + data + "</span></pre>";
        }

        return html;
    },
    syntaxHighlight : function (json) {
        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, 2);
        }

        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
});

// **************************************************************
// Collection: MessageList (model: Message)
// **************************************************************
var MessageList = Backbone.Collection.extend({
    classID: "Collection.Message [MessageList]",
    model: Message,
    initialize: function() {
        this.on('remove', this.hideModel);
    },
    hideModel: function(model){
        model.trigger('hide');
    }
});


var NoMessagesView = Backbone.Marionette.ItemView.extend({
    template: "#show-no-children-message-template"
});
