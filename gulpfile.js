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

gulp.task("compressAngular", function () {
    return gulp
        .src([
            "app/system/angular.js",
            "app/system/angular-animate.js",
            "app/system/angular-route.js"
        ])
        .pipe(ngAnnotate())
        .pipe(concat("CRT-angular.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("app"));
});

gulp.task("compressHelpersJs", function () {
    return gulp
        .src([
            "app/module/angular-local-storage.js",
            "app/module/angular-sprintf.js",
            "app/module/angular-filter-html.js",
            "app/directive/dxTree.js",
            "app/helper/firebase.js",
            "app/helper/lodash.js",
            "app/helper/sprintf.js",
            "app/helper/utils.js"
        ])
        .pipe(ngAnnotate())
        .pipe(concat("CRT-helpers.min.js"))
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

gulp.task("compressJs", function () {
    return gulp
        .src([
            "app/app.js",
            "app/config/routes.js",
            "app/config/localStorageServiceProvider.js",
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

gulp.task("default", ["compressCss", "compressAngular", "compressHelpersJs", "compressWorkersJs", "compressJs"]);
