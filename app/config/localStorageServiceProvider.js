CRT.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix("CRT")
        .setStorageType("localStorage")
        .setNotify(true, true);
});
