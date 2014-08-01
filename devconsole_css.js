DC.log("LOAD: CSS Files")

// Load CSS Files
head.load({ css_bootstrap: "//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css"}, function() {
    csslog.bw("Bootstrap 3.2.0 CSS Loaded");
});

head.load({ css_fontawesome: "//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css"}, function() {
    csslog.bw("Font Awesome 4.1.0 CSS Loaded");
});

head.ready(["css_bootstrap"], function(){


    head.load({ css_main: "assets/css/main.css"}, function() {});
    head.load({ css_anim: "assets/csslibs/css_animations.css"}, function() {});
    head.load({ css_msg: "assets/css/message-data.css"}, function() {});
    head.load({ css_pres: "assets/css/presence-data.css"}, function() {});
    head.load({ css_nav: "assets/css/nav-primary.css"}, function() {});

    head.ready(["css_main"], function(){
        csslog.bw("Primary Structure CSS Loaded");
    });

});