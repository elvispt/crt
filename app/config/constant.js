CRT.constant("GlobalConfig", {
    localStorage: {
        storiesKey: "hnStories",
        commentsFormatKey: "hnComments.%s",
        commentsExpirationFormatKey: "%s%s",
        // 1 hour (3600 * 1000), since browser JS timestamp is in miliseconds
        commentsExpiration: 3600000,
        expirationPrefixKey: "#"
    }
});
