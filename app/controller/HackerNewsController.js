/*global localStorage: false, console: false, _: false, app: false , angular: false, Utils: false, window: false, setInterval: false*/

CRT.controller("HackerNewsController", function ($scope, $filter, $timeout, $q, HackerNewsAPI, localStorageService) {
    'use strict';

    var CONFIG = {
            commentsURL: "https://news.ycombinator.com/item?id=%s",
            storiesLocalStorageKey: "hackernews"
        },
        filterOrderBy = $filter("orderBy"),
        filterSprintf = $filter("sprintf"),
        updateLocalStorage = false;

    // parses and returns an object with the story.
    function buildItem (source) {
        if (source !== undefined && source.kids !== undefined && !source.dead) {
            var url = source.url !== "" ? source.url : filterSprintf(CONFIG.commentsURL, source.id),
                commentsURL = filterSprintf(CONFIG.commentsURL, source.id),
                domain = "";
            try {
                domain = new URL(source.url !== "" ? source.url : commentsURL).hostname;
                domain = domain.replace("www.", "");
            } catch (e) {
                console.log("Failed getting hostname: " + e);
                domain = commentsURL;
            }
            return {
                id: source.id,
                url: url,
                commentsURL: commentsURL,
                commentsIds: source.kids,
                commentsCount: source.kids.length,
                title: source.title,
                domain: domain,
                time: source.time,
                score: source.score
            };
        }
    }

    // remove items that are beyond the maximum defined
    // yes this isn't very performance friendly, but I don't have to sort the list.
    function removeExcessItems() {
        var storiesList = $scope.hnews,
            maxItems = 200;
        if ($scope.hnews.length > maxItems) {
            var oldestIndex = null,
                oldestTimeFound = 8640000000000000;
            storiesList.forEach(function (item, index) {
                if (item.time < oldestTimeFound) {
                    oldestIndex = index;
                }
            });
            if (oldestIndex && typeof oldestIndex === "number") {
                $scope.hnews.splice(oldestIndex, 1);
            }
            removeExcessItems();
        }
    }

    // update or add a news story
    function setStory(item) {
        if (item !== undefined) {
            // everything seems ok. let's push a new story.
            // first checking if this news item already exists on the list.
            var index = _.findIndex($scope.hnews, function (story) {
                return story.id === item.id;
            });
            index === -1 ? addStory(item) : updateStory(item, index);
        }
    }

    // add a new story to list
    function addStory(item) {
        // doest not exist so a new entry is set
        $scope.hnews.push(item);
        updateLocalStorage = true;
        console.log("New story added");
    }

    // update a story on the items list
    function updateStory(item, index) {
        // this means it already exists. but is anything different?
        var newsItem = $scope.hnews[index];
        Object.keys(item).forEach(function (key) {
            (function () {
                if (key !== "$$hashKey" && newsItem[key] !== item[key]) {
                    // something was different
                    $scope.hnews[index] = item;
                    updateLocalStorage = true;
                    console.log("Story updated");
                    return;
                }
            }());
        });
    }

    // view-accessible methods
    // shows comments on the page
    $scope.loadComments = function (itemId, hide) {
        function isValidComment(item) {
            return item !== null && item !== undefined && !item.hasOwnProperty("dead") && item.text !== undefined;
        }
        // recursive function to obtain all the comments from a list a ids
        function buildCommentsList(childIds, cmt) {
            if (cmt === undefined) {
                cmt = [];
            }
            childIds.forEach(function (value) {
                HackerNewsAPI.getItem(value).then(function (item) {
                    if (isValidComment(item)) {
                        var tmpCmt = {
                            id: item.id,
                            by: item.by,
                            text: item.text,
                            time: item.time,
                            kids: item.kids ? item.kids : [],
                            childComments: []
                        };
                        if (tmpCmt.kids.length > 0) {
                            buildCommentsList(tmpCmt.kids, tmpCmt.childComments);
                        }
                        cmt.push(tmpCmt);
                    }
                });
            });
        }
        var index = _.findIndex($scope.hnews, function (story) {
            return story.id === itemId;
        });
        if (index !== -1) {
            $scope.comments[itemId] = [];
            if (!hide) {
                return;
            }
            buildCommentsList($scope.hnews[index].commentsIds, $scope.comments[itemId]);
        }
    };

    // this allows the end user to reorder the news stories.
    $scope.filterOrderBy = function (predicate, reverse) {
        $scope.hnews = filterOrderBy($scope.hnews, predicate, reverse);
    };

    // set this utility to be accessible on the view
    $scope.timeAgoFromEpochTime = function (time) {
        return Utils.timeAgoFromEpochTime(time);
    };

    // allow to manually refresh the list of stories.
    $scope.refreshStories = function () {
        var promise = HackerNewsAPI.topStories();
        promise.then(function (topStoriesIds) {
            topStoriesIds.forEach(function (itemId) {
                var promise = HackerNewsAPI.getItem(itemId);
                promise.then(function (source) {
                    setStory(buildItem(source));
                });
            });
        });
    };
    // ./ view-accessible methods

    // initialization procedures
    (function init() {
        var stories = localStorageService.get(CONFIG.storiesLocalStorageKey),
            clearExcessItemsTimeout = 10000;
        $scope.hnews = stories instanceof Array ? stories : [];
        $scope.comments = {};
        $scope.loader = false;
        localStorageService.bind($scope, "hnews", $scope.hnews, CONFIG.storiesLocalStorageKey);
        $timeout(removeExcessItems, clearExcessItemsTimeout);
        // finally refresh the list of stories.
        $scope.refreshStories();
    }());

    // DEBUG - just to be able to access scope on browser console.
    window.scope = $scope;
});
