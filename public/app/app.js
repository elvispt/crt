var app = angular.module("app", ["ngRoute", "ngAnimate"]);

app.config(function ($routeProvider) {
    $routeProvider.when("/", {
        templateUrl: "list_stories.html",
        controller: "FireHNController"
    }).otherwise({
        redirectTo: "/"
    });
});
