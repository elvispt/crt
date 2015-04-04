/*global localStorage: false, console: false, _: false, app: false , angular: false, Utils: false, window: false, setInterval: false, CRT: false  */

CRT.controller("HackerNewsController", function ($scope, $filter, $timeout, $interval, HackerNewsAPI, localStorageService, NavbarService) {
    'use strict';

    var CONFIG = {
            commentsURL: "https://news.ycombinator.com/item?id=%s",
            storiesLocalStorageKey: "hackernews",
            maxNumStories: 150,
            clearExcessItemsInterval: 90000,
            refreshStoriesInterval: 60000,
            workerRemoveItemsPath: "app/worker/removeExcessItems.min.js"
        },
        filterOrderBy = $filter("orderBy"),
        filterSprintf = $filter("sprintf"),
        tmpCommentCounter = 0,
        tmpCommentLimit = 20;

    // initialization procedures
    (function init() {
        var stories = localStorageService.get(CONFIG.storiesLocalStorageKey);
        $scope.hnews = stories instanceof Array ? stories : [];
        $scope.comments = {};
        $scope.loader = {};
        $scope.search = NavbarService.search;
        $scope.numItems = NavbarService.numItems;
        // this binds $scope.hnews property so that any change to it will be automatically saved to local storage.
        localStorageService.bind($scope, "hnews", $scope.hnews, CONFIG.storiesLocalStorageKey);
        // finally refresh the list of stories every n miliseconds
        $interval(refreshStories, CONFIG.refreshStoriesInterval);
        // this is not critical, hence why it can executed later.
        $interval(removeExcessItems, CONFIG.clearExcessItemsInterval);
        refreshStories();
        $scope.numItems.items = $scope.hnews.length;
    }());

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
                commentCount: source.descendants,
                author: source.by,
                title: source.title,
                text: source.text,
                domain: domain,
                time: source.time,
                score: source.score
            };
        }
    }

    // remove items that are beyond the maximum defined
    // we are using a worker to process the initial data.
    function removeExcessItems() {
        console.log("Clearing excess items");
        if ($scope.hnews.length > CONFIG.maxNumStories) {
            var worker = new Worker(CONFIG.workerRemoveItemsPath);
            worker.postMessage({
                items: $scope.hnews,
                limit: CONFIG.maxNumStories
            });
            worker.onmessage = function (message) {
                var ids = message.data,
                    indexes = [];
                if (ids instanceof Array && ids.length > 0) {
                    $scope.hnews.forEach(function (value, index) {
                        if (ids.indexOf(value.id) >= 0) {
                            indexes.push(index);
                        }
                    });
                    if (indexes.length > 0) {
                        indexes.forEach(function (value) {
                            $scope.$apply(function () {
                                $scope.hnews.splice(value, 1);
                            });
                        });
                    }
                }
                $scope.$apply(function () {
                    $scope.numItems.items = $scope.hnews.length;
                });
                worker.terminate();
            };
            worker.onerror = function (message) {
                console.log("worker ERROR");
                console.log(message);
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
                    setStory(buildItem(source));
                });
            });
        });
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
        console.log("New story added");
        $scope.numItems.items = $scope.hnews.length;
        return $scope.hnews.push(item) - 1;
    }

    // update a story on the items list
    function updateStory(item, index) {
        // this means it already exists. but is anything different?
        var newsItem = $scope.hnews[index],
            update = false;
        angular.forEach(item, function (value, key) {
            update = false;
            if (key === "commentsIds") {
                update = newsItem[key].length !== value.length;
            } else {
                update = newsItem[key] !== value;
            }
            if (update) {
                $scope.hnews[index] = item;
                console.log("Story updated");
            }
        });
        return index;
    }

    // recursive function to obtain all the comments from a list a ids
    function buildCommentsList(childIds, cmt) {
        if (cmt === undefined) {
            cmt = [];
        }
        childIds.forEach(function (value) {
            tmpCommentCounter += 1;
            if (tmpCommentCounter <= tmpCommentLimit) {
                var promise = HackerNewsAPI.getItem(value);
                promise.then(function (item) {
                    if (isValidComment(item)) {
                        var tmpCmt = {
                            id: item.id,
                            author: item.by,
                            text: item.text,
                            time: item.time,
                            kids: item.kids || [],
                            childComments: []
                        };
                        if (tmpCmt.kids.length > 0) {
                            buildCommentsList(tmpCmt.kids, tmpCmt.childComments);
                        }
                        cmt.push(tmpCmt);
                    }
                });
            }
        });
    }

    // checks if comment is valid
    function isValidComment(item) {
        return item !== null && item !== undefined && !item.hasOwnProperty("dead") && item.text !== undefined;
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
    $scope.timeAgoFromEpochTime = function (time) {
        return Utils.timeAgoFromEpochTime(time);
    };

    // reset the news list.
    $scope.resetNewsList = function () {
        console.log("Removing and refreshing news list");
        $scope.hnews = [];
        $scope.comments = [];
    };

    // clear local storage data
    $scope.clearLocalStorage = function () {
        console.log("Clearing Local Storage");
        localStorageService.clearAll();
    };
    // ./view-accessible methods

    // DEBUG - just to be able to access scope on browser console.
    window.scope = $scope;
});
