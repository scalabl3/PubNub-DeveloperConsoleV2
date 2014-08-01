var User = Backbone.Model.extend({
    defaults: {
        firstname: null,
        lastname: null,
        company: null,
        email: null,
        password: null,
        uid: null,
        token: null,
        apps: null,
        appKeys: null,
        successLogin: false,
        successApps: false,
        successKeys: false,
        successCallback: null,
        errorCallback: null
    },
    initialize: function(){

    },
    _login: function(email, password, successCallback, errorCallback){

        var credentials = {
            email: email,
            password: password
        };

        var model = this;

        $.ajax({
            type: "POST",
            url: "https://admin.pubnub.com/api/me",
            data: credentials,
            success: function(data) {

                model.set("email", email);
                model.set("password", password);
                model.set("token", data.result.token);
                model.set("uid", data.result.user.id);
                model.set("firstname", data.result.user.properties.first);
                model.set("lastname", data.result.user.properties.last);
                model.set("company", data.result.user.properties.company);
                model.set("successLogin", true);
                console.log("PUBNUB: account - login successful");

                model._get_apps();

            },
            error: function(err) {
                console.log("PUBNUB: account - Error login unsuccessful")
                console.log(err);
                var callback = this.get("errorCallback");
                if (callback && typeof(callback) == "function") {
                    callback(err);
                }
            },
            datatype: "json"

        });
    },
    _get_apps: function() {

        if (this.get("successLogin")) {

            var model = this;

            $.ajax({
                type: "GET",
                async: false,
                url: "https://admin.pubnub.com/api/apps?owner_id=" + this.get("uid").toString() + "&token=" + this.get("token"),
                success: function (data) {
                    model.set("apps", data.result);
                    model.set("successApps", true);
                    console.log("PUBNUB: account - retrieved apps");
                    //console.log(data.result);

                    model._get_app_keys();
                },
                error: function (err) {
                    console.log("PUBNUB: account - Error retrieving apps");
                    console.log(err);
                    var callback = this.get("errorCallback");
                    if (callback && typeof(callback) == "function") {
                        callback(err);
                    }
                },
                datatype: "json"
            });
        }
    },
    _get_app_keys: function(){

        this.set("successKeys", true);

        if (this.get("successLogin") && this.get("successApps")) {

            var model = this;
            var appkeys = [];

            $.each(this.get("apps"), function (i, v) {

                appkeys[i] = [];

                // Retrieve Keys for this App
                $.ajax({
                    type: "GET",
                    async: false,
                    url: "https://admin.pubnub.com/api/keys?app_id=" + v.id.toString() + "&token=" + model.get("token"),
                    success: function (data) {
                        $.each(data.result, function (j, w) {
                            var key = {
                                name: (w.properties.name ? w.properties.name : "Sandbox"),
                                pkey: w.publish_key,
                                skey: w.subscribe_key,
                                secret: w.secret_key
                            };
                            appkeys[i][j] = key;
                        });
                    },
                    error: function (err) {
                        console.log("PUBNUB: account - Error retrieving app keys");
                        model.set("successKeys", false);
                        console.log(err);
                        var callback = this.get("errorCallback");
                        if (callback && typeof(callback) == "function") {
                            callback(err);
                        }
                    },
                    datatype: "json"
                });
            });

            if (model.get("successKeys")){
                console.log("PUBNUB: account - retrieved app keys");
                //console.log(appkeys);
                model.set("appKeys", appkeys);
                model.initialize_console();
            }
        }
    },
    retrieve_account: function(settings){

        settings.email = typeof settings.email !== 'undefined' ? settings.email : this.get("email");
        settings.password = typeof settings.password !== 'undefined' ? settings.password : this.get("password");

        this.set("successCallback", typeof settings.success !== 'undefined' ? settings.success : null);
        this.set("errorCallback", typeof settings.error !== 'undefined' ? settings.error : null);

        this._login(settings.email, settings.password);
    },
    initialize_console: function(){
        var model = this;

        var apps = model.get("apps");
        var appkeys = model.get("appKeys");

        //console.log(this.toJSON());
        $.each(apps, function (i, v) {
            var app = new App({ name: v.name, pnID: v.id });
            //console.log(i, appkeys[i]);
            $.each(appkeys[i], function(j,w){
                //console.log(w);
                app.addAppKey(w.name, w.pkey, w.skey, w.secret);
            });
            pubnubAppList.add(app);
        });

        var callback = this.get("successCallback");
        if (callback && typeof(callback) == "function") {
            callback();
        }
    }
});