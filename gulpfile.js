var gulp = require("gulp"),
    ngAnnotate = require("gulp-ng-annotate"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    mc = require("gulp-minify-css"),
    rename = require('gulp-rename');

gulp.task("compressCss", function () {
    return gulp
        .src([
            "css/bootstrap.css",
            "css/main.css"
        ])
        .pipe(concat("styles.min.css"))
        .pipe(mc())
        .pipe(gulp.dest("css"));
});

gulp.task("compressHelpersJs", function () {
    return gulp
        .src([
            "app/module/angular-local-storage.js",
            "app/module/angular-sprintf.js",
            "app/module/angular-filter-utils.js",
            "app/directive/dxTree.js",
            "app/helper/firebase.js"
        ])
        .pipe(ngAnnotate())
        .pipe(concat("CRT-helpers.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("app/helper"));
});

gulp.task("compressJs", function () {
    return gulp
        .src([
            "app/app.js",
            "app/config/routes.js",
            "app/config/localStorageServiceProvider.js",
            "app/directive/crtNewsItem.js",
            "app/controller/HackerNewsController.js",
            "app/controller/NavbarController.js",
            "app/service/HackerNewsAPI.js",
            "app/service/NavbarService.js"
        ])
        .pipe(ngAnnotate())
        .pipe(concat("CRT-app.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("app"));
});

gulp.task("compressWorkersJs", function () {
    return gulp
        .src([
            "app/worker/removeExcessItems.js"
        ])
        .pipe(uglify())
        .pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest("app/worker"));
});

gulp.task("default", ["compressCss", "compressHelpersJs", "compressWorkersJs", "compressJs"]);
