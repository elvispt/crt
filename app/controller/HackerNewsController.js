/*global localStorage: false, console: false, _: false, app: false , angular: false, Utils: false, window: false, setInterval: false, CRT: false  */

CRT.controller("HackerNewsController", function ($scope, $filter, $timeout, $interval, HackerNewsAPI, localStorageService, NavbarService) {
    'use strict';

    var CONFIG = {
            storiesLocalStorageKey: "hackernews",
            maxNumStories: 100,
            clearExcessItemsTimeout: 20000,
            refreshStoriesInterval: 60000,
            workerRemoveItemsPath: "app/worker/removeExcessItems.min.js"
        },
        filterOrderBy = $filter("orderBy"),
        tmpCommentCounter = 0,
        tmpCommentLimit = 20;

    // initialization procedures
    (function init() {
        var stories = localStorageService.get(CONFIG.storiesLocalStorageKey);
        $scope.hnews = stories instanceof Array ? stories : [];
        $scope.comments = {};
        $scope.loader = {};
        $scope.search = NavbarService.search;
        $scope.numItems = $scope.hnews.length;
        // this binds $scope.hnews property so that any change to it will be automatically saved to local storage.
        localStorageService.bind($scope, "hnews", $scope.hnews, CONFIG.storiesLocalStorageKey);
        refreshStories();
        // finally refresh the list of stories every n miliseconds
        $interval(refreshStories, CONFIG.refreshStoriesInterval);
    }());

    // remove items that are beyond the maximum defined
    // we are using a worker to process the initial data.
    function removeExcessItems() {
        console.info("Clearing excess items");
        if ($scope.hnews.length > CONFIG.maxNumStories) {
            var worker = new Worker(CONFIG.workerRemoveItemsPath);
            worker.postMessage({
                items: $scope.hnews,
                limit: CONFIG.maxNumStories
            });
            worker.onmessage = function (message) {
                var storyIds = message.data;
                if (storyIds instanceof Array && storyIds.length > 0) {
                    storyIds.forEach(function (id) {
                        var index = _.findIndex($scope.hnews, function (story) {
                            return story.id === id;
                        });
                        if (index >= 0) {
                            $scope.hnews.splice(index, 1);
                        }
                    });
                    $scope.$apply(function () {
                        $scope.numItems = $scope.hnews.length;
                    });
                }
                worker.terminate();
            };
            worker.onerror = function (message) {
                console.error("worker ERROR");
                console.error(message);
                worker.terminate();
            };
        }
    }

    // allow to manually refresh the list of stories.
    function refreshStories () {
        var promise = HackerNewsAPI.topStories();
        promise.then(function (topStoriesIds) {
            topStoriesIds.forEach(function (itemId) {
                // get story details
                var promise = HackerNewsAPI.getItem(itemId);
                promise.then(function (source) {
                    setStory(source);
                });
            });
        });
        // this is not critical, hence why it can executed later.
        $timeout(removeExcessItems, CONFIG.clearExcessItemsTimeout);
    }

    // update or add a news story
    function setStory(item) {
        var index = -1;
        if (item !== undefined) {
            // everything seems ok. let's push a new story.
            // first checking if this news item already exists on the list.
            index = _.findIndex($scope.hnews, function (story) {
                return story.id === item.id;
            });
            index = index === -1 ? addStory(item) : updateStory(item, index);
        }
        return index;
    }

    // add a new story to list
    function addStory(item) {
        console.info("New story added");
        $scope.numItems = $scope.hnews.length;
        return $scope.hnews.push(item) - 1;
    }

    // update a story on the items list
    function updateStory(item, index) {
        var oldItem = $scope.hnews[index];
        // this means it already exists. but is anything different?
        Object.keys(oldItem).forEach(function (value) {
            if (shouldUpdateItem(oldItem[value], item[value])) {
                oldItem[value] = item[value];
            }
        });
        return index;
    }

    // should the item value be update, compared against the new item obtained.
    function shouldUpdateItem(oldItem, newItem) {
        return oldItem instanceof Array ? !_.isEqual(oldItem, newItem) : oldItem !== newItem;
    }

    // recursive function to obtain all the comments from a list a ids
    function buildCommentsList(childIds, cmt) {
        if (cmt === undefined) {
            cmt = [];
        }
        childIds.forEach(function (value) {
            tmpCommentCounter += 1;
            if (tmpCommentCounter <= tmpCommentLimit) {
                var promise = HackerNewsAPI.getItemComment(value);
                promise.then(function (item) {
                    if (item) {
                        if (item.kids.length > 0) {
                            buildCommentsList(item.kids, item.childComments);
                        }
                        cmt.push(item);
                    }
                });
            }
        });
    }

    // events
    // grabs the sortCommand event and sorts the list of items
    $scope.$on("sortCommand", function (event, predicate, reverse) {
        $scope.hnews = filterOrderBy($scope.hnews, predicate, reverse);
    });

    // grab the refresh command and refresh the list of stories.
    $scope.$on("refreshCommand", function (event) {
        refreshStories();
    });
    // ./events

    // view-accessible methods
    // shows comments on the page
    $scope.loadComments = function (itemId, show) {
        var index = _.findIndex($scope.hnews, function (story) {
            return story.id === itemId;
        });
        if (index !== -1) {
            $scope.loader[itemId] = !$scope.loader[itemId];
            $scope.comments[itemId] = [];
            if (!show) {
                $scope.loader[itemId] = false;
                return;
            }
            tmpCommentCounter = 0;
            buildCommentsList($scope.hnews[index].commentsIds, $scope.comments[itemId]);
            var intervalID = setInterval(function () {
                if (tmpCommentCounter >= tmpCommentLimit || tmpCommentCounter >= $scope.hnews[index].commentsIds.length) {
                    // clears itself
                    $scope.$apply(function() {
                        $scope.loader[itemId] = false;
                    });
                    clearInterval(intervalID);
                }
            }, 1000);
        }
    };

    // allows loading children comments
    $scope.loadCommentsChildren = function (parentComment) {
        tmpCommentCounter = 0;
        buildCommentsList(parentComment.kids, parentComment.childComments);
    };

    // allows loading more root level comments.
    $scope.loadMoreComments = function (itemId) {
        var index = _.findIndex($scope.hnews, function (story) {
            return story.id === itemId;
        });
        // find which root level comments where not yet loaded
        var unloadedCommentIds = _.difference($scope.hnews[index].commentsIds,
            _($scope.comments[itemId])
                .filter('id')
                .map(function (comment) {
                    return comment.id;
                })
                .value()
        );
        tmpCommentCounter = 0;
        buildCommentsList(unloadedCommentIds, $scope.comments[itemId]);
    };

    // set this utility to be accessible on the view
    $scope.timeAgo = function (time) {
        return Utils.timeAgoFromEpochTime(time);
    };

    // reset the news list.
    $scope.resetNewsList = function () {
        console.info("Removing and refreshing news list");
        $scope.hnews = [];
        $scope.comments = [];
        refreshStories();
    };

    // clear local storage data
    $scope.clearLocalStorage = function () {
        console.info("Clearing Local Storage");
        localStorageService.clearAll();
    };
    // ./view-accessible methods

    // DEBUG - just to be able to access scope on browser console.
    window.scope = $scope;
});
