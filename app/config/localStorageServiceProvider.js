CRT.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix("__CRT-")
        .setStorageType("localStorage")
        .setNotify(true, true);
});
