app.controller("FireHNController", function ($scope) { 'use strict';
    var CONFIG = {
            max_num_stories: 100,
            hn_type_story: "story",
            hn_references: {
                top_stories: "https://hacker-news.firebaseio.com/v0/topstories",
                story: "https://hacker-news.firebaseio.com/v0/item/%s"
            },
            hn_story_url: "https://news.ycombinator.com/item?id=%s"
        },
        firebase_ref = new Firebase(CONFIG.hn_references.top_stories);
    // Attach an asynchronous callback to read the data at our posts reference
    // This function will be called anytime new data is added to our Firebase reference, and we don"t need to write any extra code to make this happen.
    firebase_ref.limitToFirst(CONFIG.max_num_stories).on("value", function (query_snapshot) {
        $scope.hnews = {};
        query_snapshot.val().forEach(function (value) {
            var story = new Firebase(sprintf(CONFIG.hn_references.story, value));
            story.orderByChild('id').on("value", function (query_snapshot) {
                var item = query_snapshot.val();
                if (item !== undefined && item.kids !== undefined && ! item.dead
                    && $scope.hnews[item.id] === undefined) {
                    var url = item.url !== "" ? item.url : sprintf(CONFIG.hn_story_url, item.id);
                    var comments_url = sprintf(CONFIG.hn_story_url, item.id);
                    var domain = "";
                    try {
                        domain = item.url !== "" ? new URL(item.url).hostname : comments_url;
                    } catch (e) {
                        console.log("Failed getting hostname: " + e);
                        domain = comments_url;
                    }
                    $scope.hnews[item.id] = {
                        "id": item.id,
                        "url": url,
                        "comments_url": comments_url,
                        "title": item.title,
                        "domain": domain,
                        "time": item.time,
                        "how_long": Utils.timeAgoFromEpochTime(item.time),
                        "score": item.score
                    };
                }
                $scope.$apply();
            }, function (error) {
                console.log("The read failed: " + error.code);
            });
        });
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
});
