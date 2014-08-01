var DevConsole = Backbone.Model.extend({
   pubnub_apps: {},
   addApp: function(name, pkey, skey){
      this.pubnub_apps[name] = {
          name: name,
          pub_key: pkey,
          sub_key: skey
      }
   },
   storeLocal: function() {

   }
});

App.DConsole = new DevConsole({});
