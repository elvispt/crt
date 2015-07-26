CRT.factory("NavbarService", function () {
    'use strict';

    var that = {};

    that.search = {
        term: ""
    };

    that.actions = {
        enabled: true
    };

    return that;
});
