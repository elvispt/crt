app.config(function ($routeProvider) {
    $routeProvider.when("/", {
        templateUrl: "list_stories.html",
        controller: "HackerNewsController"
    }).otherwise({
        redirectTo: "/"
    });
});
