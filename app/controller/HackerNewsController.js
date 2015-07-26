/*global localStorage: false, console: false, _: false, app: false , angular: false, Utils: false, window: false, setInterval: false, CRT: false  */

CRT.controller("HackerNewsController", function ($scope, $filter, $timeout, $interval, HackerNewsListService, localStorageService, NavbarService, GlobalConfig) {
    'use strict';

    var CONFIG = {
            localStorage: GlobalConfig.localStorage
        },
        filterOrderBy = $filter("orderBy");

    // initialization procedures
    (function init() {
        $scope.hnews = HackerNewsListService.storiesList;
        $scope.search = NavbarService.search;
        NavbarService.actions.enabled = true;
        // this binds $scope.hnews property so that any change to it will be automatically saved to local storage.
        localStorageService.bind($scope, "hnews", $scope.hnews, CONFIG.localStorage.storiesKey);
    }());

    // events
    // grabs the sortCommand event and sorts the list of items
    $scope.$on("sortCommand", function (event, predicate, reverse) {
        $scope.hnews = filterOrderBy($scope.hnews, predicate, reverse);
    });

    // grab the refresh command and refresh the list of stories.
    $scope.$on("refreshCommand", function (event) {
        HackerNewsListService.getStories();
    });
    // ./events

    // DEBUG - just to be able to access scope on browser console.
    window.scope = $scope;
});
