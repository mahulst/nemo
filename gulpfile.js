/* Config */

// Load plugins
var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    runSequence = require('run-sequence'),
    del = require('del'),
    strip = require('gulp-strip-comments'),
    zip = require('gulp-zip'),
    inlineSource = require('gulp-inline-source'),
    inlineCss = require('gulp-inline-css'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps');

// Config variables
var config = {
  tmp_dir: './.tmp',
  build_dir: './build',
  src_dir: './src'
};


/* General tasks */

// Clean build folder
gulp.task('clean', function() {
  return del([config.build_dir]);
});

// Create Build
gulp.task('build', function(callback) {
  runSequence('clean', ['copy-assets'], 'zip-assets', 'inlineSource', 'inlineCss', 'stripComments', callback);
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
