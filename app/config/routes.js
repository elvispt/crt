CRT.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "app/partial/list_stories.html",
            controller: "HackerNewsController"
        })
        .otherwise({
            redirectTo: "/"
        });
});
