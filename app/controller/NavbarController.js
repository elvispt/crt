CRT.controller("NavbarController", function ($scope, $rootScope, NavbarService) {
    'use strict';

    $scope.filterOrderBy = function (predicate, reverse) {
        // emit an event to child controllers.
        $rootScope.$broadcast("sortCommand", predicate, reverse);
    };

    $scope.refreshStories = function () {
        $rootScope.$broadcast("refreshCommand");
    };

    // initialization procedures
    (function init() {
        $scope.search = NavbarService.search;
        $scope.actions = NavbarService.actions;
    }());
});
