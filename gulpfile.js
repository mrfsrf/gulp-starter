'use strict';

const gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync').create(),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  changed = require('gulp-changed'),
  uglify = require('gulp-uglify');

 
function style() {
    return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'])
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
}
 
function js() {
  return gulp.src((['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'src/js/*.js']))
  .pipe(gulp.dest('dist/js'))
  .pipe(browserSync.stream());
}
 
function watch() {
  browserSync.init({
    server: {
      baseDir: './'
    },
    port: 8080
  });
 
  gulp.watch('src/scss/*.scss', style).on('change', browserSync.reload);
  gulp.watch('src/js/*.js', js).on('change', browserSync.reload);
  gulp.watch('./*.html').on('change', browserSync.reload);
}
 
exports.style = style;
exports.js = js;
exports.watch = watch;
