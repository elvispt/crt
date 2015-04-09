CRT.directive("newsItem", function () {
   return {
       restrict: "E",
       scope: {
           item: "=",
           comments: "=",
           loader: "=",
           loadComments: "&",
           loadCommentsChildren: "&",
           loadMoreComments: "&",
           timeAgo: "&"
       },
       templateUrl: "app/directive/crtNewsItem.html"
   }
});