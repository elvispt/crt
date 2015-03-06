var app = angular.module("app", ["ngRoute", "angular-toArrayFilter", "ngAnimate"]);

app.config(function ($routeProvider) {
    $routeProvider.when("/", {
        templateUrl: "list_stories.html",
        controller: "FireHNController"
    }).otherwise({
        redirectTo: "/"
    });
});
