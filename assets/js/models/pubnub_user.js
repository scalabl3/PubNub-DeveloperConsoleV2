var User = Backbone.Model.extend({
    defaults: {
        id: 1,
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
        loginComplete: false,
        successCallback: null,
        errorCallback: null,
        localStorage: null
    },
    initialize: function(){
    },
    localStorage: new Backbone.LocalStorage("DevConsoleUser"),
    _login: function(){

        var credentials = {
            email: this.get("email"),
            password: this.get("password")
        };

        var model = this;

        $.ajax({
            type: "POST",
            url: "https://admin.pubnub.com/api/me",
            data: credentials,
            success: function(data) {

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
                console.log("PUBNUB: account - Error login unsuccessful");
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
                            appkeys[i][j] = {
                                name: (w.properties.name ? w.properties.name : "Sandbox"),
                                pkey: w.publish_key,
                                skey: w.subscribe_key,
                                secret: w.secret_key,
                                enabled: w.status === 1,
                                hasPresence: checkValue(w.properties.presence, 'int', 1),
                                hasHistory: checkValue(w.properties.history, 'int', 1),
                                hasPAM: checkValue(w.properties.uls, 'int', 1),
                                hasMultiplex: checkValue(w.properties.multiplexing, 'int', 1),
                                hasAnalytics: checkValue(w.properties.realtime_analytics, 'int', 1),
                                hasApplePush: checkValue(w.properties.apns, 'int', 1)
                            };
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
                model.set("loginComplete", true);
                model.initialize_console();
            }
        }
    },
    retrieve_account: function(settings){

        settings.email = typeof settings.email !== 'undefined' ? settings.email : this.get("email");
        settings.password = typeof settings.password !== 'undefined' ? settings.password : this.get("password");

        this.set("email", settings.email);
        this.set("password", settings.password);

        this.set("successCallback", typeof settings.success !== 'undefined' ? settings.success : null);
        this.set("errorCallback", typeof settings.error !== 'undefined' ? settings.error : null);

        this._login();

    },
    retrieve_apps: function(settings) {

        this.set("successCallback", typeof settings.success !== 'undefined' ? settings.success : null);
        this.set("errorCallback", typeof settings.error !== 'undefined' ? settings.error : null);

        this._login();

    },
    login_complete: function() {
        return this.get("loginComplete");
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
        if (_.isFunction(callback)) {
            callback();
        }
    }
});