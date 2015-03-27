CRT.controller("NavbarController", function ($scope, NavbarService) {
    'use strict';

    $scope.navBar = NavbarService.navBar;
});