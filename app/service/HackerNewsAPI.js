CRT.service("HackerNewsAPI", function ($filter, $q) {
    'use strict';

    var CONFIG = {
            MaxNumStories: 100,
            hnFirebaseRefs: {
                topStories: "https://hacker-news.firebaseio.com/v0/topstories",
                item: "https://hacker-news.firebaseio.com/v0/item/%s"
            },
            commentsURL: "https://news.ycombinator.com/item?id=%s"
        },
        filterSprintf = $filter("sprintf"),
        that = {};

    // returns, as promise, the list of top stories.
    that.topStories = function () {
        var deferred = $q.defer();
        // Attach an asynchronous callback to read the data at our posts reference
        // This function will be called anytime new data is added to our Firebase reference, and we don"t need to write any extra code to make this happen.
        new Firebase(CONFIG.hnFirebaseRefs.topStories).limitToFirst(CONFIG.MaxNumStories)
            .once("value", function (query_snapshot) {
                var topStoriesIds = query_snapshot.val();
                if (topStoriesIds instanceof Array) {
                    deferred.resolve(topStoriesIds);
                } else {
                    deferred.reject([]);
                }
            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
                deferred.reject([]);
            });
        return deferred.promise;
    };

    // get a single item data
    that.getItem = function (itemId) {
        var deferred = $q.defer();
        new Firebase(filterSprintf(CONFIG.hnFirebaseRefs.item, itemId)).orderByChild('id')
            .once("value", function (query_snapshot) {
                deferred.resolve(query_snapshot.val());
            }, function (error) {
                console.log("The read failed: " + error.code);
                deferred.reject([]);
            });
        return deferred.promise;
    };

    return that;
});
