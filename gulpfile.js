/*File: gulpfile.js*/

// Gulp Packages
var gulp        = require('gulp')
  , gutil       = require('gulp-util')
  , jade        = require('gulp-jade')
  , jshint      = require('gulp-jshint')
  , nodemon     = require('gulp-nodemon')
  , prettify    = require('gulp-prettify')
  , sass        = require('gulp-sass');


// Nodemon
gulp.task('start', function () {
  nodemon({
    script: 'index.js'
  , ext: 'js css html'
  , env: { 'NODE_ENV': 'development' }
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

// Jade 
gulp.task('jade', function() {
  gulp.src('./source/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('./public/'))
})

// Prettify
gulp.task('prettify', function() {
  gulp.src('./public/views/*.html')
    .pipe(prettify({indent_size: 2}))
    .pipe(gulp.dest('./public/views/'))
})

// JShint
gulp.task('jshint', function(){
  return gulp.src(['public/scripts/**/*.js', './index.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

// Watch 
gulp.task('watch', function(){
  gulp.watch('public/scripts/**/*.js', ['jshint']);
  gulp.watch('./source/**/*.jade', ['jade']);
  gulp.watch('./source/**/*.jade', ['prettify']);
});

// Default task message
gulp.task('default', ['start', 'jade', 'prettify', 'watch'], function(){
  return gutil.log('Gulp is running!!');
});