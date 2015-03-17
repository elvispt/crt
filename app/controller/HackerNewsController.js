app.controller("HackerNewsController", function ($scope, $filter, HackerNewsAPI) {
    'use strict';

    var filter_order_by = $filter("orderBy"),
        stories_localStore_key = "hackernews",
        update_localStorage = false,
        callback = function (item) {
            if (item !== undefined) {
                // angular black magic wasn't working so I had to wrap the callback in the apply function
                $scope.$apply(function () {
                    // everything seems ok. let's push a new story.
                    // first checking if this news item already exists on the list.
                    var index = _.findIndex($scope.hnews, function (story) {
                            return story.id === item.id;
                        }),
                        local_diff = false;
                    if (index === -1) {
                        // doest not exist so a new entry is set
                        $scope.hnews.push(item);
                        local_diff = true;
                        update_localStorage = true;
                        console.log("New story added");
                    } else {
                        // this means it already exists. but is anything different?
                        var news_item = $scope.hnews[index];
                        Object.keys(item).forEach(function (key) {
                            (function () {
                                if (key !== "$$hashKey" && news_item[key] != item[key]) {
                                    local_diff = true;
                                    update_localStorage = true;
                                    return;
                                }
                            })();
                        });
                        if (local_diff) {
                            // something was different
                            $scope.hnews[index] = item;
                        }
                    }
                });
            }
        };

    // lets get the news from localStorage first.
    (function () {
        var localnews = localStorage.getItem(stories_localStore_key);
        if (!localnews) {
            // we have nothing
            $scope.hnews = [];
        } else {
            try {
                $scope.hnews = JSON.parse(localnews);
            } catch (e) {
                console.log("Could not parse news list from localStorage: " + e);
            }
        }
    })();

    // save data to localStorage every N miliseconds.
    setInterval(function set_to_localStorage() {
        if (update_localStorage && $scope.hnews.length > 0) {
            // we can't set the new data to localStore with Angular's $$hashKey so we use angular.copy
            localStorage.setItem(stories_localStore_key, JSON.stringify(angular.copy($scope.hnews)));
            update_localStorage = false;
            console.log("Data set to localStorage");
        }
    }, 10000);

    // this allows the end user to reorder the news stories.
    $scope.order = function (predicate, reverse) {
        $scope.hnews = filter_order_by($scope.hnews, predicate, reverse);
    };

    // set this utility to be accessible on the view
    $scope.timeAgoFromEpochTime = function (time) {
        return Utils.timeAgoFromEpochTime(time);
    };

    // get the hacker news stories to show on the page.
    HackerNewsAPI.get_stories(callback);

    // DEBUG - just to be able to access scope on browser console.
    window.scope = $scope;
});
