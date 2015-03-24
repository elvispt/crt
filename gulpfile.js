var gulp = require("gulp");
var ngAnnotate = require('gulp-ng-annotate');
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var mc = require("gulp-minify-css");

gulp.task('compressCss', function () {
    return gulp
        .src([
            "css/bootstrap.css",
            "css/main.css"
        ])
        .pipe(concat("styles.min.css"))
        .pipe(mc())
        .pipe(gulp.dest("css"));
});

gulp.task('compressJs', function () {
    return gulp
        .src([
            "app/system/angular.js",
            "app/system/angular-animate.js",
            "app/system/angular-route.js",
            "app/module/angular-local-storage.js",
            "app/module/angular-sprintf.js",
            "app/module/angular-filter-html.js",
            "app/directive/dxTree.js",
            "app/helper/firebase.js",
            "app/helper/lodash.js",
            "app/helper/sprintf.js",
            "app/helper/utils.js",
            "app/app.js",
            "app/config/routes.js",
            "app/config/localStorageServiceProvider.js",
            "app/controller/HackerNewsController.js",
            "app/service/HackerNewsAPI.js"
        ])
        .pipe(ngAnnotate())
        .pipe(concat("CRT.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("app"));
});

gulp.task('default', ['compressCss', 'compressJs']);
