Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};

window.checkValue = function (x, type, value) {
    if (typeof x === 'undefined') {
        return false;
    }
    if (type === 'int') {
        try {
            y = parseInt(x);
        }
        catch (e) {
            return false;
        }

        return y === value;
    }
};