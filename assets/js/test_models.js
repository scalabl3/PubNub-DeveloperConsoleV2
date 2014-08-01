var login = false;

if (login) {

    var credentials = {
        email: "jasdeep@scalabl3.com",
        password: "Keridian8"
    };
    var doLogin = function() {
        $.ajax({
            type: "POST",
            url: "https://admin.pubnub.com/api/me",
            data: credentials,
            success: function(data) {
                DC.user = data.result;
                console.log(data.result);
                doGetApps();
            },
            error: function(x) {
                console.log("LOGIN ERROR")
                console.log(x);
            },
            datatype: "json"

        });
    };

    var doGetApps = function() {
        if (DC.user) {
            $.ajax({
                type: "GET",
                url: "https://admin.pubnub.com/api/apps?owner_id=" + DC.user.user.id.toString() + "&token=" + DC.user.token,
                success: function(result) {



                    var apps = result.result;
                    console.log(apps);

                    $.each(apps, function(i,v){
                        var app = new App({ name: v.name, pnID: v.id });


                        // Retrieve Keys for this App
                        $.ajax({
                            type: "GET",
                            url: "https://admin.pubnub.com/api/keys?app_id=" + v.id.toString() + "&token=" + DC.user.token,
                            success: function(data) {


                                var keys = data.result;

                                $.each(keys, function(i,v){
                                    var name = (v.properties.name ? v.properties.name : "Sandbox");
                                    app.addAppKey(name, v.publish_key, v.subscribe_key);
                                });

                            },
                            error: function(x) {
                                console.log("GET KEYS ERROR");
                                console.log(x);
                            },
                            datatype: "json"
                        });


                        pubnubAppList.add(app);
                    });
                },
                error: function(x) {
                    console.log("GET APPS ERROR");
                    console.log(x);
                },
                datatype: "json"
            });
        }
    };

    doLogin();

}
else {
//    // Add Demo to List
//    var app1 = new App({ name: "Demo" });
//    app1.addAppKey("Sandbox", "demo", "demo");
//    app1.addAppKey("Staging", "demo", "demo");
//    app1.addAppKey("Production", "demo", "demo");
//
//    var app2 = new App({ name: "Demo2" });
//    app2.addAppKey("Sandbox", "demo2", "demo2");
//    app2.addAppKey("Production", "demo2", "demo2");
//
//    pubnubAppList.add(app1);
//    pubnubAppList.add(app2);
//
//    var k1 = pubnubAppList.at(0).get("appKeys").at(0);
//    //console.log(k1);
//    k1.add_channel("devconsole");
//    k1.add_channel("devconsole2");
//
//    var k2 = pubnubAppList.at(0).get("appKeys").at(1);
//    //console.log(k1);
//    k2.add_channel("devconsole3");
//    k2.add_channel("devconsole4");

}





//console.log(pubnubAppListView.el);

/*
setInterval(function(){
    pubnubAppList.at(0).toggle_active();
    //console.log(pubnubAppListView.el);
}, 1000);

setTimeout(function() {
    setInterval(function(){
        pubnubAppList.at(1).toggle_active();
        //console.log(pubnubAppListView.el);
    }, 1000);
}, 500);
*/
