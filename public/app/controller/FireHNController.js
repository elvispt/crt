app.controller("FireHNController", function ($scope, $filter) { 'use strict';
    var CONFIG = {
            max_num_stories: 100,
            hn_type_story: "story",
            hn_references: {
                top_stories: "https://hacker-news.firebaseio.com/v0/topstories",
                story: "https://hacker-news.firebaseio.com/v0/item/%s"
            },
            hn_story_url: "https://news.ycombinator.com/item?id=%s"
        };
    var filter_order_by = $filter('orderBy');
    $scope.hnews = [];
    // Attach an asynchronous callback to read the data at our posts reference
    // This function will be called anytime new data is added to our Firebase reference, and we don"t need to write any extra code to make this happen.
    new Firebase(CONFIG.hn_references.top_stories).limitToFirst(CONFIG.max_num_stories)
        .on("value", function (query_snapshot) {
            query_snapshot.val().forEach(function (value) {
                new Firebase(sprintf(CONFIG.hn_references.story, value)).orderByChild('id')
                    .on("value", function (query_snapshot) {
                        build_item(query_snapshot.val());
                        $scope.$apply();
                    }, function (error) {
                        console.log("The read failed: " + error.code);
                    });
            });
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

    function build_item(source) {
        if (source !== undefined
            && source.kids !== undefined && ! source.dead) {
            var exists = false;
            $scope.hnews.forEach( function (value) {
                ( function () {
                    if (value.id === source.id) {
                        exists = true;
                        return;
                    }
                })();
            });
            if ( ! exists) {
                var url = source.url !== "" ? source.url : sprintf(CONFIG.hn_story_url, source.id);
                var comments_url = sprintf(CONFIG.hn_story_url, source.id);
                var domain = "";
                try {
                    domain = new URL(source.url !== "" ? source.url : comments_url).hostname;
                    domain = domain.replace("www.", "");
                } catch (e) {
                    console.log("Failed getting hostname: " + e);
                    domain = comments_url;
                }
                $scope.hnews.push({
                    id: source.id,
                    url: url,
                    comments_url: comments_url,
                    num_comments: source.kids.length,
                    title: source.title,
                    domain: domain,
                    time: source.time,
                    how_long: Utils.timeAgoFromEpochTime(source.time),
                    score: source.score
                });
            }
        }
    }

    $scope.order = function (predicate, reverse) {
        $scope.hnews = filter_order_by($scope.hnews, predicate, reverse);
    };
});
