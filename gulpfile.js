/* File: gulpfile.js */

var gulp    = require('gulp'),
    gutil   = require('gulp-util'),
    jshint  = require('gulp-jshint'),
    nodemon  = require('gulp-nodemon'),
    prettify = require('gulp-prettify'), 
    sass    = require('gulp-sass');

gulp.task('nodemon', function () {
  nodemon({
    script: 'index.js', 
    ext: 'js css html', 
    env: { 'NODE_ENV': 'development' }
  })
  .on('start', function () {
    console.log('nodemon started')
  })
  .on('restart', function () {
    console.log('>> node restart');
  })
  .on('crash', function () {
    console.log('script crashed for some reason');
  })
});

gulp.task('sass', function() {
  gulp.src('./source/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./public/styles/'))
});

gulp.task('jshint', function(){
  return gulp.src(['public/scripts/**/*.js', './index.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function(){
  gulp.watch('public/scripts/**/*.js', ['jshint']);
  gulp.watch('./source/**/*.scss', ['sass']);
});

gulp.task('build', ['nodemon', 'sass', 'prettify'])
gulp.task('default', ['build', 'watch'], function(){
  return gutil.log('Gulp is running!!');
});
