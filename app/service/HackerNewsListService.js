CRT.factory("HackerNewsListService", function (localStorageService, HackerNewsAPI, GlobalConfig, $filter, $interval, $timeout) {
    'use strict';

    var CONFIG = {
            localStorage: GlobalConfig.localStorage,
            refreshStoriesInterval: 60000,
            maxNumStories: 100,
            clearExcessItemsTimeout: 20000,
            workerRemoveItemsPath: "app/worker/removeExcessItems.min.js"
        },
        tmpCommentCounter = 0,
        tmpCommentLimit = 25,
        storiesList = [],
        storyComments = {},
        filterSprintf = $filter("sprintf");

    (function init() {
        var stories = localStorageService.get(CONFIG.localStorage.storiesKey);
        storiesList = stories instanceof Array ? stories : [];
        // finally refresh the list of stories every n miliseconds
        $interval(getStories, CONFIG.refreshStoriesInterval);
        getStories();
    }());

    // refreshes the list of stories
    function getStories() {
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

    // returns the index of a story from the story id
    function getStoryIndex(storyId) {
        storyId = parseInt(storyId, 10);
        return _.findIndex(storiesList, function (story) {
            return story.id === storyId;
        });
    }

    // update or add a news story
    function setStory(item) {
        var index = -1;
        if (item !== undefined) {
            // everything seems ok. let's push a new story.
            // first checking if this news item already exists on the list.
            index = getStoryIndex(item.id);
            index = index === -1 ? addStory(item) : updateStory(item, index);
        }
        return index;
    }

    // add a new story to list
    function addStory(item) {
        console.info("New story added");
        return storiesList.push(item) - 1;
    }

    // update a story on the items list
    function updateStory(item, index) {
        var oldItem = storiesList[index];
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

    // remove items that are beyond the maximum defined. Using a worker to process the initial data.
    function removeExcessItems() {
        console.info("Clearing excess items");
        if (storiesList > CONFIG.maxNumStories) {
            var worker = new Worker(CONFIG.workerRemoveItemsPath);
            worker.postMessage({
                items: storiesList,
                limit: CONFIG.maxNumStories
            });
            worker.onmessage = function (message) {
                var storyIds = message.data;
                if (storyIds instanceof Array && storyIds.length > 0) {
                    storyIds.forEach(function (id) {
                        var index = getStoryIndex(id);
                        if (index >= 0) {
                            storiesList.splice(index, 1);
                        }
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

    // recursive function to obtain all the comments from a list a ids
    function buildCommentsList(commentsIds, cmt) {
        commentsIds.forEach(function (value) {
            tmpCommentCounter += 1;
            if (tmpCommentCounter <= tmpCommentLimit) {
                var promise = HackerNewsAPI.getItemComment(value);
                promise.then(function (item) {
                    if (!Utils.isEmpty(item)) {
                        if (item.kids.length > 0) {
                            buildCommentsList(item.kids, item.childComments);
                        }
                        cmt.push(item);
                    }
                });
            }
        });
    }

    // allows loading more root level comments.
    function loadMoreComments (itemId) {
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
    }

    function getItemExpiration(key) {
        var expiration = localStorageService.get(key);
        if (Utils.isEmpty(expiration) || isNaN(expiration)) {
            expiration = 0;
        }
        return expiration;
    }

    // public data/methods
    return {
        storiesList: storiesList,
        getStories: getStories,
        storyComments: storyComments,
        getStory: function (storyId) {
            var index = getStoryIndex(storyId);
            return storiesList[index];
        },
        getComments: function (storyId, forceRefresh) {
            // lets get from localStorage first
            var commentsKey = filterSprintf(CONFIG.localStorage.commentsFormatKey, storyId),
                expirationKey = filterSprintf(
                    CONFIG.localStorage.commentsExpirationFormatKey,
                    CONFIG.localStorage.expirationPrefixKey, commentsKey),
                storyIndex = getStoryIndex(storyId),
                comments = localStorageService.get(commentsKey),
                expiration = getItemExpiration(expirationKey);
            if (!forceRefresh && expiration > Math.floor(Date.now()) && !Utils.isEmpty(comments)) {
                console.info("Getting comments from local storage");
                storyComments[storyId] = comments;
            } else {
                tmpCommentCounter = 0;
                storyComments[storyId] = [];
                console.info("Getting comments from API");
                buildCommentsList(storiesList[storyIndex].commentsIds, storyComments[storyId]);
                $timeout(function () {
                    console.info("Saving comments to localStorage");
                    localStorageService.set(commentsKey, storyComments[storyId]);
                    localStorageService.set(expirationKey, Date.now() + (3600 * 1000));
                }, 10000);
            }
        }
    };
});
