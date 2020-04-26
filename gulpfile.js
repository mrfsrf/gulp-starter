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
  hasher = require('gulp-hasher'),
  changed = require('gulp-changed'),
  uglify = require('gulp-uglify');

// File location vars  
const src_dir = "./src",
      src_js = `${src_dir}/js`,
      src_sass = `${src_dir}/sass`,
      assets = "./assets",
      src_fonts = `${assets}/fonts`,
      src_images = `${assets}/images`,
      out_dir = "./public",
      out_css = `${out_dir}/css`,
      out_js = `${out_dir}/js`,
      out_images = `${out_dir}/images`;

 
function style() {
    return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', `${src_sass}/**/*.scss`])
    .pipe(sass())
    .pipe(gulp.dest(`${out_css}/css`))
    .pipe(browserSync.stream());
}
 
function js() {
  return gulp.src((['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', `${src_js}/*.js`]))
  .pipe(gulp.dest(`${out_js}`))
  .pipe(browserSync.stream());
}

function images() {
  return gulp.src(`${src_images}/**/*`)
    .pipe(imagemin([   // Basic: .pipe(imagemin())
      pngquant({
        speed: 1,
        quality: [0.95, 1] //lossy settings
      }),
      imagemin.svgo({ // SVG optimization
        plugins: [
          {removeViewBox: false},
          {cleanupIDs: false}
        ]
      })
      ]))
    .pipe(gulp.dest(`${out_images}`))
    .pipe(hasher());    // hash and cache them
}

function watch() {
  browserSync.init({
    server: {
      baseDir: './'
    },
    port: 8080
  });
 
 // Todo
 // gulp.watch(`${src_sass}/**/*.scss`, style).on('change', browserSync.reload);
  gulp.watch(`${src_images}/**/*`, images).on('change', browserSync.reload);
  gulp.watch(`${src_js}/*.js`, js).on('change', browserSync.reload);
  gulp.watch('./*.html').on('change', browserSync.reload);
}


 
exports.style = style;
exports.js = js;
exports.images = images;
exports.watch = watch;
