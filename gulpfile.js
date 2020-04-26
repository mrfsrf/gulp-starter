'use strict';

const { src, dest, series, parallel, watch } = require('gulp'),
  del = require('del'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync').create(),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCss = require('gulp-clean-css'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  rename = require('gulp-rename'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
 // hasher = require('gulp-hasher'), // replace with plugin that works with > gulp4
  hash = require('gulp-hash-filename'),
  changed = require('gulp-changed'),
  uglify = require('gulp-uglify');

// File location vars  
const src_dir = "./src",
      src_js = `${src_dir}/js`,
      src_sass = `${src_dir}/sass`,
      assets = "./assets",
      src_fonts = `${assets}/fonts`,
      src_images = `${assets}/images/`,
      out_dir = "./public",
      out_css = `${out_dir}/css`,
      out_js = `${out_dir}/js`,
      out_images = `${out_dir}/images`;

// Third party libraries
const bootstrap_js = 'node_modules/bootstrap/dist/js/bootstrap.min.js',
      jquery_js = 'node_modules/jquery/dist/jquery.min.js';

function css() {
  // ['node_modules/bootstrap/scss/bootstrap.scss', `${src_sass}/**/*.scss`]
  return src([`${src_sass}/**/*.scss`])
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 1 version'))
    .pipe(sourcemaps.write())
    .pipe(hash()) // rename file using hash
    .pipe(dest(`${out_css}`))
    .pipe(uglify())
    .pipe(rename(function (path) { path.basename += "-min"; }))
    .pipe(dest(`${out_css}`))
    .pipe(browserSync.stream());
}

// concat styles
function concatCss() {
  return src([`${src_sass}/**/*.scss`])
    .pipe(concat('main.min.css'))
    .pipe(sourcemaps.init({ loadMaps: true, largeFile: true }))
    .pipe(cleanCSS({debug: true}, (details) => {
      console.log(`${details.name}: ${details.stats.originalSize}`);
      console.log(`${details.name}: ${details.stats.minifiedSize}`);
          }))
    .pipe(sourcemaps.write('./'))
    .pipe(dest(`${out_css}`))
}
 
function js() {
  // third party + our js
  return src(([`${bootstrap_js}`, `${jquery_js}`, `${src_js}/*.js`]))
  .pipe(concat('main.js'))
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(uglify())
  .pipe(rename(function (path) { path.basename += ".min"; }))
  .pipe(sourcemaps.write('./'))
  // .pipe(size({ title: '  Final JS output:', showFiles: true })) // Show info (size node)
  .pipe(dest(`${out_js}`))
  .pipe(browserSync.stream());
}

function images() {
  return src(`${src_images}/**/*.{jpg,jpeg,png,svg}`)
    .pipe(changed(`${out_images}`)) // or better {since: gulp.lastRun(images)}
    .pipe(imagemin([  // Basic: .pipe(imagemin())
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
    .pipe(dest(`${out_images}`))
    .pipe(hasher());  // hash and cache them
}

async function clean() {
  await del(out_dir);
}

function watcher() {
  browserSync.init({
    // proxy: "localhost:13500",
    notify: false,
    open: false,
    server: {
      baseDir: './'
    },
    port: 8080
  });
 
  // Todo
  watch(`${src_sass}/**/*.scss`, series([css, concatCss])).on('change', series(css, concatCss, browserSync.reload));
  watch(`${src_images}/**/*`, images).on('change', browserSync.reload);
  watch(`${src_js}/*.js`, js).on('change', browserSync.reload);
  watch(['./*.html', `./${out_js}/main.min.js`, `./${out_css}/main.min.css`]).on('change', browserSync.reload);
}


 
exports.css = css;
exports.concatCss = concatCss;
exports.js = js;
exports.images = images;
exports.watcher = watcher;
exports.clean = clean;
exports.cleanCss = series(clean, parallel(css, concatCss, images, js), watcher);

// !!!
const build = parallel(watcher);
gulp.task('default', build);
