CRT.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "app/partial/list_stories.html",
            controller: "HackerNewsController"
        })
        .when("/story/:id", {
            templateUrl: "app/partial/story.html",
            controller: "StoryController"
        })
        .otherwise({
            redirectTo: "/"
        });
});
