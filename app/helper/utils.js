var Utils = (function () {

    var that = {};

    /**
     * falsy: false, 0, "0", '0', "", '', {}, [], null, undefined, NaN
     * @param value Any value type.
     * @returns {boolean} Returns true if the value if falsy is an empty object or an empty array, false otherwise.
     */
    that.isEmpty = function (value) {
        if (value instanceof Array) {
            return value.length === 0;
        }
        if (value !== null && typeof value === "object") {
            return Object.keys(value).length === 0;
        }
        return !value || value === "0";
    };

    return that;
}());
