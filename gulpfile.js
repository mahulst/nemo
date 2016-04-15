/* Config */

// Load plugins
var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    runSequence = require('run-sequence'),
    del = require('del'),
    rename = require("gulp-rename"),
    strip = require('gulp-strip-comments'),
    zip = require('gulp-zip'),
    inlineSource = require('gulp-inline-source'),
    inlineCss = require('gulp-inline-css'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    preprocess = require('gulp-preprocess');

// Config variables
var config = {
  build_dir: './build',
  tmp_dir:   './build/.tmp',
  src_dir:   './src'
};


/* General tasks */

// Clean build folder
gulp.task('clean', function() {
  return del([config.build_dir]);
});

// Create Build
gulp.task('build', function(callback) {
  runSequence('clean', ['copy-assets'], 'sass', 'zip-assets', 'inlineSource', ['templateConsumer', 'templateBusiness'], 'inlineCss', 'stripComments', 'removeTemp', callback);
});

// Default
gulp.task('default', function(callback) {
  runSequence('clean', 'build', callback);
});

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: config.src_dir
    });

    gulp.watch(config.src_dir + "/scss/**/*.scss", ['sass']);
    gulp.watch(config.src_dir + "/*.html").on('change', browserSync.reload);
});


/* Specific tasks */

// 1. Inline source of css
gulp.task('inlineSource', function() {
  return gulp.src(config.src_dir + '/*.html')
        .pipe(inlineSource())
        .pipe(gulp.dest(config.tmp_dir));
});

// 2.1 Template Consumer
gulp.task('templateConsumer', function() {
  return gulp.src(config.tmp_dir + '/index.html')
    .pipe(preprocess({
      context: { TEMPLATE: 'consumer'}
    }))
    .pipe(rename('index-consumer.html'))
    .pipe(gulp.dest(config.build_dir));
});

// 2.2 Template Business
gulp.task('templateBusiness', function() {
  return gulp.src(config.tmp_dir + '/index.html')
    .pipe(preprocess({
      context: { TEMPLATE: 'business'}
    }))
    .pipe(rename('index-business.html'))
    .pipe(gulp.dest(config.build_dir));
});

// 2. Inline CSS
gulp.task('inlineCss', function() {
  return gulp.src(config.build_dir + '/*.html')
    .pipe(inlineCss({
      applyStyleTags: true,
      applyLinkTags: true,
      removeStyleTags: true,
      removeLinkTags: true,
      preserveMediaQueries: true
    }))
    .pipe(gulp.dest(config.build_dir));
});

// 3. Strip HTML comments
gulp.task('stripComments', function () {
  return gulp.src(config.build_dir + '/*.html')
    .pipe(strip({
      safe: true,
      trim: true
    }))
    .pipe(gulp.dest(config.build_dir));
});

// 4. Remove .tmp folder
gulp.task('removeTemp', function () {
  return del([config.tmp_dir]);
});


// Copy image directory
gulp.task('copy-assets', function() {
  return gulp.src(config.src_dir + '/images/**/*')
    .pipe(gulp.dest(config.build_dir + '/images/'));
});

// Zip image directory
gulp.task('zip-assets', function() {
  return gulp.src(config.build_dir + '/images/*')
    .pipe(zip('images.zip'))
    .pipe(gulp.dest(config.build_dir));
});

// Sass
gulp.task('sass', function () {
  return gulp.src(config.src_dir + '/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.src_dir + '/css'))
    .pipe(browserSync.stream());
});
