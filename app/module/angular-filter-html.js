// thx to Leeroy Brun http://stackoverflow.com/a/21254635
angular.module('ngUtils', []).filter('trustHtml', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
});
