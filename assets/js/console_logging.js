(function (app) {
    var SCHEMES = ['gw:white:green',
        'by:yellow:black',
        'bw:white:blue',
        'cw:white:darkcyan'];
    // if string param, prepend it in all logs. if not, the usual
    // color should work. Check if first param is string, and add it.
    function fmtType(arg) {
        if (typeof arg == 'string') {
            return '%s';
        }
        return '%o';
    }

    function fmtString(args) {
        var fmtArr = [];
        for (var i = 0; i < args.length; i++) {
            fmtArr.push(fmtType(args[i]));
        }
        return fmtArr.join(' ');

    }

    function colorStr(bg, fg, args) {
        return ["%c" + fmtString(args), "background-color:" + bg + ';color:' + fg + ';padding:1px;'];
    };
    function colorLog(bg, fg, args) {
        var fmt = colorStr(bg, fg, args);
        console.log.apply(console, fmt.concat(args));
    };

    function addPrefixToArgs(str, args) {
        args = Array.prototype.slice.call(args);
        return [str].concat(args);
    }

    function generateLogger(prefix) {
        var fn = function () {
            console.log.apply(console, addPrefixToArgs(prefix, arguments));
        };
        SCHEMES.forEach(function (e) {
            var name = e.split(':')[0],
                bg = e.split(':')[1],
                fg = e.split(':')[2];

            fn[name] = function () {
                colorLog(bg, fg, addPrefixToArgs(prefix, arguments));
            };
        });

        return fn;
    }

    function instrument_fns(proto, cb) {
        var i;

        function instrument_fn(fn, name, h) {
            if (typeof fn != 'function') return;

            h[name] = function () {
                var args = Array.prototype.slice.call(arguments);
                cb.call(this, name, args, this);
                return fn.apply(this, args);
            };
        }

        for (i in proto) {
            log.red("fn", i);
            instrument_fn(proto[i], i, proto);
        }
    }

    var log = generateLogger('');

    log.withPrefix = function (name) {
        if (typeof name != 'string') {
            return log;
        }

        return generateLogger(name);
    };

    log.noop = function () {
        return function () {
        };
    };
    log.mute = function () {
        var fn = log.noop();
        SCHEMES.forEach(function (e) {
            var bg = e.split(':')[0],
                fg = e.split(':')[1];
            fn[bg] = log.noop();
        });
        return fn;
    };

    log.instrument_fns = instrument_fns;
    app.log = log;
}(DC));

var csslog = DC.log.withPrefix("\tCSS:");
var jslog = DC.log.withPrefix("\tJS:");
var modellog = DC.log.withPrefix("\tModel:");
