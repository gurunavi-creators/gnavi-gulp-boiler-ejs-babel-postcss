/**
 * gulp-boiler
 *
 * ** 開発開始手順
 *
 * $ npm i
 * $ gulp iamgemin
 *
 *
 * ** 開発開始 with watchコマンド
 *
 * $ gulp start
 *
 * ** buildコマンド
 *
 * $ gulp
 *
 * ** iamgeminコマンド
 *
 * $ gulp iamgemin
 *
 * ** js testコマンド
 *
 * $ gulp test
 *
 * ** dist、tmp削除コマンド
 *
 * $ gulp clean
 *
 * ---------------------------------------------------------------------- */

/*
 * init package
 */
import gulp from 'gulp'
import runSequence from 'run-sequence'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import browserSync from 'browser-sync'
import rename from 'gulp-rename'
import size from 'gulp-size'
import postcss from 'gulp-postcss'
import moment from 'momentjs'

//const timestump = moment().format('YYYYMMDDhhmmss')
const timestump = '20161012113446'
const version = require('./version.json')


/*
 * task manage
 */
// build:css
gulp.task('build:css', () => {
  runSequence('precss', 'renamecss', 'postcss')
})

// build:js
gulp.task('build:js', () => {
  runSequence('babel', 'concat', 'test')
})

// build:js lib
gulp.task('concat', () => {
  runSequence('concat:lib')
})

// build:html
gulp.task('build:html', () => {
  runSequence('ejs')
})

// build:copy
gulp.task('build:copy', () => {
  runSequence('copy')
})

// imagemin
gulp.task('imagemin', () => {
  runSequence('imageMin')
})

// test
gulp.task('test', () => {
  runSequence('eslint')
})

// build
gulp.task('build', () => {
  return runSequence(
    'build:css', 'build:js', 'build:html', 'build:copy'
  )
})

// default
gulp.task('default', () => {
  runSequence('build')
})


/*
 * option task
 */
// start
gulp.task('start', () => {
  return runSequence(
    'build', 'watch', 'serve'
  )
})

// local
gulp.task('local', () => {
  runSequence('build')
})

// dev
gulp.task('dev', () => {
  runSequence('build')
})


/*
 * directory
 */
const directory = {
  src: 'src/',
  dist: 'dist/',
  tmp: 'tmp/',
  html_src: 'src/ejs/',
  css_src: 'src/css/',
  js_src: 'src/js/',
  img_src: 'src/img/'
};


/*
 * stat path
 */
const pathStat = {
  local: './',
  test_x: 'http://hoge/'
};


/*
 * js parts
 */
const js_part = {
  lib: [
    directory.js_src + 'lib/jquery-3.0.0.min.js',
    directory.js_src + 'lib/lodash.min.js'
  ],
  common: [
    directory.js_src + 'common/utility.js',
    directory.js_src + 'common/sample_a.js'
  ]
};


/*
 * BrowserSync
 */
gulp.task('serve', () => {
  const syncOption = {
    port: 8051,
    ui: {
      port: 8052
    },
    server: {
      baseDir: directory.dist
    }
  }
  browserSync(syncOption)
})


/*
 * watch
 */
gulp.task('watch', () => {
  console.log('---------- watch ----------')
  return (function(){
    gulp.watch(directory.css_src + '**/*.css', ['build:css']).on('change', browserSync.reload)
    gulp.watch(directory.js_src + '**/*.js', ['build:js']).on('change', browserSync.reload)
    gulp.watch(directory.html_src + '**/*.{ejs,json}', ['build:html']).on('change', browserSync.reload)
    gulp.watch(directory.img_src + '**/*.{png,jpg}', ['build:copy']).on('change', browserSync.reload)
    gulp.watch('gulpfile.js', ['build']).on('change', browserSync.reload)
  })()
})


/*
 * clean
 */
import clean from 'del'
gulp.task('clean', () => {
  console.log('---------- clean ----------')
  clean(directory.tmp)
  clean(directory.dist)
  clean(directory.tmp_dev)
})


/*
 * imageMin
 */
import imagemin from 'gulp-imagemin'
gulp.task('imageMin', () => {
  console.log('---------- imageMin ----------')
  return gulp.src(directory.img_src + '**/*')
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(directory.img_src))
})


/*
 * postcss
 */
// precss(scss like)
import precss from 'precss'
gulp.task('precss', () => {
  console.log('---------- css ----------')
  return gulp.src(directory.css_src + '**/*.css')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(postcss([
        precss()
    ]))
    .pipe(gulp.dest(directory.tmp + 'css/'))
})

// rename
gulp.task('renamecss', () => {
  return gulp.src(directory.tmp + 'css/common/import.css')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(rename('common-' + version.css.common + '.css'))
    .pipe(gulp.dest(directory.tmp + 'css/'))
})

// postcss
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
gulp.task('postcss', () => {
  return gulp.src(directory.tmp + 'css/*.css')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(postcss([
      autoprefixer ({
        browsers: ['last 2 version', 'ie >= 9'],
        cascade: false
       }),
      cssnano({
        minifyFontValues: {
          removeQuotes: false
        }
      })
    ]))
    .pipe(gulp.dest(directory.dist + 'css/'))
    .pipe(size({title:'size : css'}))
})


/*
 * js
 */
// es2015
import babel from 'gulp-babel'
import concat from 'gulp-concat-util'
import minify from 'gulp-babel-minify'
import uglify from 'gulp-uglify'

// babel
gulp.task('babel', () => {
  console.log('---------- js ----------')
  return gulp.src(js_part.common)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(concat('common-' + version.js.common + '.js'))
    .pipe(gulp.dest(directory.tmp + 'js/'))
    .pipe(concat.header([
      '(function(window, $){',
      "  'use strict'",
      ''
    ].join('\n')))
    .pipe(concat.footer([
      '',
      '})(window, window.jQuery)'
    ].join('\n')))
    .pipe(babel({
      filename: 'common-' + version.js.common + '.js',
      presets: [["es2015", {"loose": true}]],
      compact: true,
      minified: true,
      comments: false
    }))
    .pipe(uglify())
    .pipe(gulp.dest(directory.dist + 'js/'))
    .pipe(size({title:'size : js common'}))
})

// concat
// lib
gulp.task('concat:lib', () => {
  return gulp.src(js_part.lib)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(concat('lib-' + version.js.lib + '.js'))
    .pipe(gulp.dest(directory.dist + 'js/'))
    .pipe(size({title:'size : js lib'}))
})


/*
 * js test
 */
// eslint
import eslint from 'gulp-eslint'
gulp.task('eslint', () => {
  return gulp.src(directory.tmp + 'js/common-' + version.js.common + '.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
})


/*
 * html
 */
// ejs
import ejs from 'gulp-ejs'
import minifyejs from 'gulp-minify-ejs'
gulp.task('ejs', () => {
  console.log('---------- html ----------')
  gulp.src(
      [
        directory.html_src + 'html/**/*.ejs',
        '!' + directory.html_src + 'html/include/**/*.ejs'
      ]
    )
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(ejs(
      {
        data:{
          default: require('./' + directory.html_src + 'data/common/default.json'),
          nav: require('./' + directory.html_src + 'data/common/nav.json'),
          sample: require('./' + directory.html_src + 'data/module/sample.json'),
          version: require('./version.json')
        },
        timestump: timestump,
        pathStat: pathStat.local
      },
      {ext: '.html'}
    ))
    .pipe(gulp.dest(directory.dist + '/'))
    .pipe(size({title:'size : html'}))
})


/*
 * copy
 */
gulp.task('copy', () => {
  console.log('---------- copy ----------')
  return gulp.src(
    [
      directory.img_src + '**/*'
    ],
    {base: directory.src}
  )
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(gulp.dest(directory.dist))
})


