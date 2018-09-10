var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var notify = require("gulp-notify");
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var gulpSourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var order = require('gulp-order');
var del = require('del');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var merge = require('merge-stream');

gulp.task('serve', ['vendor','sass', 'js'], function () {
    browserSync.init({
        server: {
            baseDir: 'app',
            routes:{
                "/node_modules" : "node_modules"
            }
        }
    });

    gulp.watch("app/*.html").on('change', browserSync.reload);
    gulp.watch("app/sass/**/*.sass", ['sass']);
    gulp.watch("app/js/**/*.js", ['js']);
});

gulp.task('sass', function() {
    return gulp.src('app/sass/style.sass')
        .pipe(gulpSourcemaps.init())
        .pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
        .pipe(rename({suffix: '.min', prefix : ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS())
        .pipe(gulpSourcemaps.write(''))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream());
});

gulp.task('js', function() {
    return gulp.src(['app/js/**/*.js', '!app/js/main.min.js', '!app/js/vendor.min.js'])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('vendor', ['vendor:css', 'vendor:js', 'vendor:fonts']);

gulp.task('vendor:js', function () {
    return gulp.src([
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'node_modules/jquery/dist/jquery.min.js'
    ])
        .pipe(order([
            'jquery.min.js'
        ]))
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'));
});

gulp.task('vendor:css', function () {
    return 	gulp.src([
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
        'node_modules/font-awesome/css/font-awesome.min.css'
    ])
        .pipe(concat('vendor.min.css'))
        .pipe(cleanCSS({
            level: {
                1: {
                    specialComments: 'none'
                }
            }
        }))
        .pipe(gulp.dest('app/css'))
});

gulp.task('vendor:fonts', function () {
    return 	gulp.src([
        'node_modules/bootstrap/dist/fonts/*',
        'node_modules/font-awesome/fonts/*'
    ]).pipe(gulp.dest('app/fonts'))
});


gulp.task('build', ['cleanBuild', 'vendor', 'sass', 'js'], function () {

    return merge(

        gulp.src('app/index.html')
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest('build')),

        gulp.src([
            'app/js/main.min.js',
            'app/js/vendor.min.js'
        ]).pipe(gulp.dest('build/js')),

        gulp.src([
            'app/css/style.min.css',
            'app/css/vendor.min.css'
        ]).pipe(gulp.dest('build/css')),

        gulp.src([
            'app/fonts/**/*'
        ]).pipe(gulp.dest('build/fonts')),

        gulp.src('app/images/**/*')
            .pipe(cache(imagemin()))
            .pipe(gulp.dest('build/images'))

    );
});

gulp.task('cleanBuild', function () {
    return del.sync('build');
});


gulp.task('clearCache', function () {
    return cache.clearAll();
});

gulp.task('start-build', function() {
    browserSync.init({
        server: {
            baseDir: 'build'
        }
    });
});




gulp.task('default', ['serve']);