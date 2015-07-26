CRT.controller("StoryController", function ($scope, $routeParams, $interval, HackerNewsListService, NavbarService) {
    'use strict';

    var CONFIG = {
        refreshCommentsInterval: 30000
    };

    // initialize the controller
    (function init() {
        $scope.story = HackerNewsListService.getStory($routeParams.id);
        HackerNewsListService.getComments($routeParams.id);
        var comments = HackerNewsListService.storyComments;
        $scope.comments = comments[$routeParams.id];
        NavbarService.actions.enabled = false;
        var interval = $interval(function () {
            HackerNewsListService.getComments($routeParams.id, true);
        }, CONFIG.refreshCommentsInterval);

        // lets stop the interval when we leave this controller
        $scope.$on("$destroy", function () {
            if (interval) {
                $interval.cancel(interval);
            }
        });
    }());

    // DEBUG - just to be able to access scope on browser console.
    window.scope = $scope;
});
