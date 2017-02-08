var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    gutil         = require('gulp-util'),
    jshint        = require('gulp-jshint'),
    browserify    = require('browserify'),
    argv          = require('yargs').argv,
    browsersync   = require('browser-sync')
    karma         = require('karma').server,
    bower         = require('gulp-bower'),
    concat        = require('gulp-concat'),
    cleandest     = require('gulp-clean-dest'),
    gulpif        = require('gulp-if'),
    empty         = require('gulp-empty'),
    jade          = require('gulp-jade'),
    htmlmin       = require('gulp-htmlmin'),
    cssmin        = require('gulp-cssnano'),
    uglify        = require('gulp-uglify'),
    ngAnnotate    = require('gulp-ng-annotate'),
    path          = require('path'),
    protractor    = require('gulp-protractor').protractor,
    exit          = require('gulp-exit'),
    mocha         = require('gulp-mocha'),
    watchify      = require('watchify'),
    stringify     = require('stringify'),
    rename        = require('gulp-rename'),
    source        = require('vinyl-source-stream'),
    shell         = require('gulp-shell'),
    nodemon       = require('gulp-nodemon'),
    reload        = require('gulp-livereload'),
    imagemin      = require('gulp-imagemin'),
    cache         = require('gulp-cache'),
    taskListing   = require('gulp-task-listing'),
    autoprefixer  = require('gulp-autoprefixer'),
    istanbul      = require('gulp-istanbul'),
    sourcemaps    = require('gulp-sourcemaps');

var rootPath           = 'app/',
    public_path          = 'public/',

    whitelist_extensions = '{jpg,jpeg,gif,png,swf,flv,eot,svg,ttf,woff,woff2,otf,ico,htc,pdf,mp4,ogv,webm}',

    js_root              = rootPath + 'application.js',
    js_controllers_glob  = rootPath + 'scripts/controllers/*.js',
    js_directives_glob   = rootPath + 'scripts/directives/*.js',
    js_filters_glob      = rootPath + 'scripts/filters/*.js',
    js_services_glob     = rootPath + 'scripts/services/*.js',
    js_watcher_glob      = rootPath + 'scripts/**/*.js',
    js_standalone_glob   = rootPath + 'standalone/**/*.js',

    sass_path            = rootPath + 'styles/',

    paths = {
      jade_watcher_glob     : rootPath + '**/*.jade',
      jade_partials_glob    : rootPath + 'partials/*.jade',
      jade_root_glob        : rootPath + 'index.jade',
      jade_404              : rootPath + '404.jade',

      sass_watcher_glob     : sass_path  + '**/*.sass',
      sass_combined_glob    : sass_path  + '*.sass',            // base dir only
      sass_standalone_glob  : sass_path  + 'standalone/**/*.sass',
      css_vendor_glob       : sass_path  + 'vendor/**/*.css',

      lint_controllers      : js_controllers_glob,
      lint_directives       : js_directives_glob,
      lint_services         : js_services_glob,
      lint_filters          : js_filters_glob,
      lint_root             : js_root,

      video_glob            : rootPath + 'video/**/*.'  + whitelist_extensions,
      image_glob            : rootPath + 'images/**/*.' + whitelist_extensions,
      font_glob             : rootPath + 'fonts/**/*.'  + whitelist_extensions,

      reload_globs          : [
                                'public/**/*.html',
                                'public/styles/**/*.+(css|css.map|min.css)',
                                'public/images/**/*.' + whitelist_extensions,
                              ]
      // staticFiles : [
      //   '!app/**/*.+(sass|css|sass)',
      //   '!app/images/*.+(png|jpg|gif)',
      //   '!app/**/*.+(jade)',
      //   '!app/**/*.+(js)',
      //   'app/**/*.*'
      // ]
    };

// compile sass
gulp.task('sass', ['sass-combined', 'sass-standalone', 'css_vendor_glob']);
var autoprefixer_options = {
      browsers: [
        '> 1%',
        'last 2 versions',
        'firefox >= 4',
        'safari 7',
        'safari 8',
        'IE 8',
        'IE 9',
        'IE 10',
        'IE 11'
      ],
      cascade: false
    };

gulp.task('sass-combined', function() {
  var output_path = public_path + 'styles';

  return gulp.src(paths.sass_combined_glob)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer(autoprefixer_options))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(output_path))
    .pipe(reload());
});

gulp.task('sass-standalone', function() {
  var output_path = public_path + 'styles';

  return gulp.src(paths.sass_standalone_glob)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer(autoprefixer_options))
    .pipe(sourcemaps.write('.'))
    .pipe(cleandest(output_path))
    .pipe(gulp.dest(output_path))
    .pipe(reload());
});

// compile vendor lib
gulp.task('css_vendor_glob', function () {
  var output_path = public_path + 'styles',
      filename    = 'vendor.css';

  return gulp.src(paths.css_vendor_glob)
    .pipe(concat(filename))
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(cleandest(output_path))
    .pipe(gulp.dest(output_path))
})

// compile jade
gulp.task('jade',
  ['jade_partials_glob', 'jade_root_glob', 'jade_404']);

gulp.task('jade_partials_glob', function() {
  var output_path = public_path + 'partials';

  return gulp.src(paths.jade_partials_glob)
    .pipe(cleandest(output_path))
    .pipe(jade())
    .pipe(gulp.dest(output_path))
    .pipe(reload());
});

gulp.task('jade_root_glob', function() {
  var output_path =  public_path;

  return gulp.src(paths.jade_root_glob)
    .pipe(jade())
    .pipe(gulp.dest(output_path))
    .pipe(reload());
});

gulp.task('jade_404', function() {
  var output_path =  public_path;

  return gulp.src(paths.jade_404)
    .pipe(jade())
    .pipe(gulp.dest(output_path))
    .pipe(reload());
});

// compile javascripts
gulp.task('js',
  ['js_controllers_glob', 'js_directives_glob', 'js_services_glob', 'js_filters_glob'])

gulp.task('js_controllers_glob', function() {
  var output_path = public_path + 'scripts',
      filename    = 'controllers.js';

  return gulp.src(js_controllers_glob)
    .pipe(concat(filename))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulpif(argv.development, empty(), ngAnnotate()))
    .pipe(gulpif(argv.development, empty(), uglify()))
    .pipe(gulp.dest(output_path))
    .pipe(reload());
});

gulp.task('js_directives_glob', function() {
  var output_path = public_path + 'scripts',
      filename    = 'directives.js';

  return gulp.src(js_directives_glob)
    .pipe(concat(filename))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulpif(argv.development, empty(), ngAnnotate()))
    .pipe(gulpif(argv.development, empty(), uglify()))
    .pipe(gulp.dest(output_path))
    .pipe(reload());
});

gulp.task('js_services_glob', function() {
  var output_path = public_path + 'scripts',
      filename    = 'services.js';

  return gulp.src(js_services_glob)
    .pipe(concat(filename))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulpif(argv.development, empty(), ngAnnotate()))
    .pipe(gulpif(argv.development, empty(), uglify()))
    .pipe(gulp.dest(output_path))
    .pipe(reload());
});

gulp.task('js_filters_glob', function() {
  var output_path = public_path + 'scripts',
      filename    = 'filters.js';

  return gulp.src(js_filters_glob)
    .pipe(concat(filename))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulpif(argv.development, empty(), ngAnnotate()))
    .pipe(gulpif(argv.development, empty(), uglify()))
    .pipe(gulp.dest(output_path))
    .pipe(reload());
});

// copy assets
gulp.task('assets', ['images', 'fonts', 'videos']);

gulp.task('images', function() {
  var output_path = public_path + 'images';

  return gulp.src(paths.image_glob)
    .pipe(cleandest(output_path))
    .pipe(cache(imagemin({
      optimizationLevel : 3,
      progressive : true,
      interlaced : true
    })))
    .pipe(gulp.dest(output_path))
    .pipe(reload());
});

gulp.task('fonts', function() {
  var output_path = public_path + 'fonts';

  return gulp.src(paths.font_glob)
    .pipe(cleandest(output_path))
    .pipe(gulp.dest(output_path))
    .pipe(reload());
});

gulp.task('videos', function() {
  var output_path = public_path + 'videos';

  return gulp.src(paths.video_glob)
    .pipe(cleandest(output_path))
    .pipe(gulp.dest(output_path))
    .pipe(reload())
});


// nodemon server
gulp.task('nodemon', function() {
  nodemon({
    script: 'index.js',
    ext: 'js css html',
    env: { 'NODE_ENV': 'development' }
  })
  .on('start', function() {
    console.log('nodemon started')
  })
  .on('restart', function() {
    console.log('>> node restart');
  })
  .on('crash', function() {
    console.log('script crashed for some reason');
  })
});

// linters
gulp.task('lint', function() {
  return gulp.src(
      [
        paths.lint_controllers,
        paths.lint_directives,
        paths.lint_services,
        paths.lint_filters,
        paths.lint_root
      ]
    )
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

// browserify
gulp.task('browserify', function() {
  var output_path = public_path + 'scripts',
      b           = browserify();

  b.add(js_root);
  return b.bundle()
    .on('success', gutil.log.bind(gutil, 'Browserify Rebundled'))
    .on('error', gutil.log.bind(gutil, 'Browserify Error: in browserify gulp task'))
    .pipe(source('index.js'))
    .pipe(gulp.dest(output_path));
});

// bower
// fix April 6, 2016 at 11:02:07 PM GMT+1
gulp.task('bower', function() {
  var output_path = public_path + 'lib/'
  return bower()
    // .pipe(gulpif(argv.development, empty(), ngAnnotate()))
    .pipe(gulp.dest(output_path))
});

// reload
gulp.task('reload', function() {
  reload.reload()
})

// watcher
gulp.task('watch', ['build'], function() {
  reload.listen();
  gulp.watch(paths.sass_watcher_glob, ['sass']);
  gulp.watch(paths.jade_watcher_glob, ['jade']);
  gulp.watch(js_watcher_glob,         ['browserify']);
  gulp.watch(paths.image_glob,        ['images']);
  gulp.watch(paths.font_glob,         ['fonts']);
  gulp.watch(paths.video_glob,        ['videos']);
  gulp.watch(paths.reload_globs,      ['reload']);
});

gulp.task('watch:lint', function() {
  gulp.watch(paths.lint_controllers,  ['lint']);
  gulp.watch(paths.lint_directives,   ['lint']);
  gulp.watch(paths.lint_services,     ['lint']);
  gulp.watch(paths.lint_filters,      ['lint']);
  gulp.watch(paths.lint_root,         ['lint']);
});

// build
gulp.task('build', ['jade', 'sass', 'js', 'assets', 'browserify']);

// serve
gulp.task('serve', ['nodemon']);

// setup
gulp.task('setup', shell.task([
  'bower install',
  'npm install'
]));

gulp.task('help', taskListing);
gulp.task('production',         ['nodemon', 'build']);
gulp.task('heroku:production',  ['build']);
gulp.task('test',               ['test:client', 'test:server']);
gulp.task('default',            ['build', 'nodemon', 'watch'],
  function(){
    return gutil.log('Gulp is running!!');
  });
