/**
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/

import gulp from 'gulp';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import pkg from './package.json';

const imagemin = require('gulp-imagemin');
const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const app_path = './app';


// Lint JavaScript
gulp.task('lint', () =>
  gulp.src('./app/assets/scripts/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failOnError()))
);

// Optimize images
gulp.task('images', () =>
  gulp.src('./app/assets/images/**/*')
    .pipe($.imagemin())
    .pipe(gulp.dest( './app/dist/img'))
    .pipe($.size({title: 'images'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    './app/assets/styles/main.scss',
  ])
    .pipe($.sourcemaps.init())
    .pipe($.sass({ precision: 10 }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.if('*.css', $.cssnano({discardComments: {removeAll: true}})))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest( './app/dist/css' ));
});

//Styles watch
gulp.task('styles:watch', ['styles'], () => {
	gulp.watch("./app/assets/styles/**/*", ['styles']);
});

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enable ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
gulp.task('scripts', () =>
    gulp.src([
      './app/assets/scripts/libs/*.js',
      './app/assets/scripts/src/*.js'
    ])
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.concat('main.min.js'))
      .pipe($.uglify({ compress: true }))
      // Output files
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('./app/dist/js' ))
);

// Watch files for changes & reload
gulp.task('serve', ['scripts', 'styles', 'images'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: '**WSK**',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    browser: 'google chrome',
    server: ['app'],
    port: 3004
  });

  gulp.watch(['./app/**/*.html'], reload);
  gulp.watch(['./app/assets/styles/**/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['./app/assets/scripts/libs/*.js', './app/assets/scripts/src/*.js'], ['scripts', reload]);
  gulp.watch(['./app/assets/images/**/*'], ['images', reload]);
});

// Watch files for changes & reload
gulp.task('serve-simple', ['scripts', 'styles'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: '**WSK**',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    browser: 'google chrome',
    server: ['app'],
    port: 3004
  });

  gulp.watch(['./app/**/*.html'], reload);
  gulp.watch(['./app/assets/styles/**/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['./app/assets/scripts/libs/*.js', './app/assets/scripts/src/*.js'], ['scripts', reload]);
});