// requires Keys/KeysList
//
// App
// AppView
// AppList
// AppListView
//
//

// **************************************************************
// Layout Scheme
// **************************************************************

/*
<div class="nav-section">
    <span class="nav-section-title">PUBNUB APPS</span>
</div>
<ul class="nav nav-pubnub-apps">
    <li class="app active">
        <a href="#"><i class="fa"></i> <span>Demo</span></a>
        <i class="fa fa-times-circle clickable"></i>
    </li>
    <li class="app">
        <a href="#"><i class="fa"></i> <span>Scalabl3</span></a>
        <i class="fa fa-times-circle clickable"></i>
    </li>
    <li class="feature-link"><a href="#"><i class="fa fa-plus"></i> <span>Add App...</span></a></li>
</ul>
*/
    
// **************************************************************
// Model: App
//  * contains KeyList
// **************************************************************
var App = Backbone.Model.extend({
    classID: "Model.App [App]",
    defaults: {
        uuid: null,
        name: "unspecified",
        active: false,
        appKeys: null
    },
    initialize: function(){
        this.set("uuid", "pubnub-developer-console");
        this.set("appKeys", new KeysList());
    },
    addAppKey: function(name, pkey, skey, secretKey) {
        var klist = this.get("appKeys");

        var k = new Keys({
            appName: this.get("name"),
            name: name,
            pubkey: pkey,
            subkey: skey,
            secretKey: secretKey
        });

        klist.add(k);
        this.set("appKeys", klist);
    },
    removeAppKey: function(name) {

    },
    toggle_active: function() {
        // toggle true-false, false-true
        if (this.get("active")) {
            this.set("active", false);
        }
        else {
            this.set("active", true);
        }
    }
});

// **************************************************************
// View: App
// **************************************************************
var AppView = Backbone.View.extend({
    classID: "View.App [AppView]",
    tagName: 'li',
    className: 'app',
    rawTemplate: '<a class="action-activate" href="#"><i class="fa"></i> <span>{{name}}</span></a>', //<i data-action="delete" class="action-configure fa fa-times-circle clickable"></i>',
    compiledTemplate: null,
    initialize: function(){
        //this.model.on('change', this.render, this);
        this.compiledTemplate = Handlebars.compile(this.rawTemplate);
    },
    events: {
        'click .action-activate': 'toggle_active'
    },
    toggle_active: function() { this.model.toggle_active(); },
    render_active: function() {
        if (this.model.get("active")) {
            this.$el.addClass("active");
        }
        else {
            this.$el.removeClass("active");
        }
    },
    render: function() {
        //console.log("AppView render");
        var attributes = this.model.toJSON();
        //var compiledTemplate = Handlebars.compile(this.rawTemplate);
        this.$el.html(this.compiledTemplate(attributes));

        if (this.model.get("active")) {
            this.$el.addClass("active");
        }
        else {
            this.$el.removeClass("active");
        }
    }
});

// **************************************************************
// Collection: AppList (model: App)
// **************************************************************
var AppList = Backbone.Collection.extend({
    classID: "Collection.App [AppList]",
    model: App,
    selectedAppIndex: 0,
    initialize: function(){
        //this.on('change:active', this.changeActive, this);
    }
});

//// **************************************************************
//// Collection View: AppListView
//// **************************************************************
//var AppListView = Backbone.CollectionView.extend({
//    el: $("ul#pubnub-app-list"),
//    initialize: function(){
//        this.collection.on('add', this.addOneApp, this);
//        this.listenTo(this.collection, 'change:active', this.changeActive, this);
//    },
//    changeActive: function(changedModel, val, options) {
////        console.log("Changed Model: " + changedModel.get('uuid') + ": " + changedModel.get("active").toString());
////        _.each(this.collection.models, (function(m){
////            if (m.get("uuid") !== changedModel.get("uuid")) {
////                if (m.get("active")) {
////                    m.set("active", false, { silent: true });
////                }
////            }
////        }));
//    },
//    render: function() {
//        this.collection.forEach(this.addOneApp, this);
//    },
//    render_keys: function() {
//        console.log("Render Keys for selected App");
//    },
//    addOneApp: function(modelItem) {
//        var modelView = new AppView({ model: modelItem });
//        modelView.render();
//        this.$el.append(modelView.el);
//    },
//    classID: "View.AppList [AppListView]"
//});

