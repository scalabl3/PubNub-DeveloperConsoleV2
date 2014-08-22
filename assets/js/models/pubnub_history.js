// requires Message, MessageView
//
// HistoryList
//
//

// **************************************************************
// Collection: MessageList (model: Message)
// **************************************************************
var HistoryList = Backbone.Collection.extend({
    classID: "Collection.Message [MessageList]",
    model: Message,
    initialize: function() {
        this.on('remove', this.hideModel);
    },
    hideModel: function(model){
        model.trigger('hide');
    }
});

