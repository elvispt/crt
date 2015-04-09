var gulp = require("gulp"),
    ngAnnotate = require("gulp-ng-annotate"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    mc = require("gulp-minify-css"),
    rename = require('gulp-rename'),
    cssFileList = [
        "css/bootstrap.css",
        "css/main.css"
    ],
    jsHelperFileList = [
        "app/module/angular-local-storage.js",
        "app/module/angular-sprintf.js",
        "app/module/angular-filter-utils.js",
        "app/directive/dxTree.js",
        "app/helper/firebase.js"
    ],
    jsFileList = [
        "app/app.js",
        "app/config/routes.js",
        "app/config/localStorageServiceProvider.js",
        "app/config/constant.js",
        "app/directive/crtNewsItem.js",
        "app/controller/HackerNewsController.js",
        "app/controller/NavbarController.js",
        "app/service/HackerNewsAPI.js",
        "app/service/NavbarService.js"
    ],
    jsWorkerFileList = [
        "app/worker/removeExcessItems.js"
    ];

gulp.task("compressCss", function () {
    return gulp
        .src(cssFileList)
        .pipe(concat("styles.min.css"))
        .pipe(mc())
        .pipe(gulp.dest("css"));
});

gulp.task("compressHelpersJs", function () {
    return gulp
        .src(jsHelperFileList)
        .pipe(ngAnnotate())
        .pipe(concat("CRT-helpers.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("app/helper"));
});

gulp.task("compressJs", function () {
    return gulp
        .src(jsFileList)
        .pipe(ngAnnotate())
        .pipe(concat("CRT-app.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("app"));
});

gulp.task("compressWorkersJs", function () {
    return gulp
        .src(jsWorkerFileList)
        .pipe(uglify())
        .pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest("app/worker"));
});

// manually run all tasks
gulp.task("default", ["compressCss", "compressHelpersJs", "compressWorkersJs", "compressJs"]);

// run a watch function for the tasks
gulp.task('watch', function () {
    gulp.watch(cssFileList, ["compressCss"]);
    gulp.watch(jsHelperFileList, ["compressHelpersJs"]);
    gulp.watch(jsFileList, ["compressJs"]);
    gulp.watch(jsWorkerFileList, ["compressWorkersJs"]);
});
