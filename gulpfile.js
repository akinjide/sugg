var gulp = require('gulp')
var browserify = require('browserify')
var argv = require('yargs').argv
var Karma = require('karma').Server
var $ = require('gulp-load-plugins')({ lazy: true })
var source = require('vinyl-source-stream')
var path = require('path')

/**
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing)
gulp.task('default', ['help'])

var config = {
  packages: [
    path.resolve(__dirname, 'package.json')
  ],
  nodeModules: 'node_modules',
  src: 'client/src/',
  public: 'client/public/',
  browserReloadDelay: 1000,
  extensions: '{jpg,jpeg,gif,png,swf,flv,eot,svg,ttf,woff,woff2,otf,ico,htc,pdf,mp4,ogv,webm}',
  defaultPort: process.env.PORT || '1338'
}

var paths = {
  root: __dirname,
  js: {
    root: config.src + 'app/application.js',
    controllers_glob: config.src + 'app/controllers/*.js',
    directives_glob: config.src + 'app/directives/*.js',
    services_glob: config.src + 'app/services/*.js',
    filters_glob: config.src + 'app/filters/*.js',
    watcher_glob: config.src + 'app/**/*.js',
    vendors_glob: config.src + 'scripts/**/*.js',
    bower: config.src + 'scripts/bower.js'
  },
  sass: {
    root: config.src + 'styles/',
    combined_glob: config.src + 'styles/*.sass', // base dir only
    watcher_glob: config.src + 'styles/**/*.sass'
  },
  css: {
    vendor: config.src + 'styles/vendor.js'
  },
  jade: {
    root: config.src + 'index.jade',
    watcher_glob: config.src + '**/*.jade',
    partials_glob: config.src + 'app/partials/*.jade',
    four0four: config.src + '404.jade'
  },
  files: {
    video_glob: config.src + 'videos/**/*.' + config.extensions,
    image_glob: config.src + 'images/**/*.' + config.extensions,
    font_glob: 'client/public/lib/lumx/dist/fonts/*.' + config.extensions
  },
  reload_globs: [
    config.public + '**/*.html',
    config.public + 'styles/**/*.+(css|css.map|min.css)',
    config.public + 'images/**/*.' + config.extensions
  ],
  index: config.public + 'index.html'
}

var autoprefixerOptions = {
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
}

// compile sass
gulp.task('sass', ['sass-combined', 'css-vendor-combined'])

gulp.task('sass-combined', function () {
  var out = config.public + 'styles'

  log('Compiling Sass --> CSS')
  return gulp.src(paths.sass.combined_glob)
    .pipe($.sourcemaps.init())
    .pipe($.sass({ outputStyle: 'compressed' }))
    .pipe($.autoprefixer(autoprefixerOptions))
    .pipe($.sourcemaps.write('.'))
    .pipe($.cleanDest(out))
    .pipe(gulp.dest(out))
})

// compile vendor lib
gulp.task('css-vendor-combined', function () {
  var out = config.public + 'styles'
  var filename = 'vendor.css'

  return gulp.src(require('./' + paths.css.vendor))
    .pipe($.concat(filename))
    .pipe($.sourcemaps.init())
    .pipe($.cssnano())
    .pipe($.sourcemaps.write('.'))
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.cleanDest(out))
    .pipe(gulp.dest(out))
})

// compile jade
gulp.task('jade', ['jade-partials-glob', 'jade-root', 'jade-four0four'])

gulp.task('jade-partials-glob', function () {
  log('Compiling Jade --> HTML')
  var out = config.public + 'views'

  return gulp.src(paths.jade.partials_glob)
    .pipe($.cleanDest(out))
    .pipe($.jade())
    .pipe($.htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest(out))
})

gulp.task('jade-root', function () {
  return gulp.src(paths.jade.root)
    .pipe($.jade())
    .pipe(gulp.dest(config.public))
})

gulp.task('jade-four0four', function () {
  return gulp.src(paths.jade.four0four)
    .pipe($.jade())
    .pipe(gulp.dest(config.public))
})

// compile javascripts
gulp.task('js', ['js-controllers-glob', 'js-directives-glob', 'js-services-glob', 'js-filters-glob'])

gulp.task('js-controllers-glob', function () {
  log('Compressing and copying controllers')
  var filename = 'controllers.js'

  return gulp.src(paths.js.controllers_glob)
    .pipe($.concat(filename))
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.if(argv.development, $.empty(), $.ngAnnotate()))
    .pipe($.if(argv.development, $.empty(), $.uglify()))
    .pipe(gulp.dest(config.public + 'scripts'))
})

gulp.task('js-directives-glob', function () {
  log('Compressing and copying directives')
  var filename = 'directives.js'

  return gulp.src(paths.js.directives_glob)
    .pipe($.concat(filename))
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.if(argv.development, $.empty(), $.ngAnnotate()))
    .pipe($.if(argv.development, $.empty(), $.uglify()))
    .pipe(gulp.dest(config.public + 'scripts'))
})

gulp.task('js-services-glob', function () {
  log('Compressing and copying services')
  var filename = 'services.js'

  return gulp.src(paths.js.services_glob)
    .pipe($.concat(filename))
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.if(argv.development, $.empty(), $.ngAnnotate()))
    .pipe($.if(argv.development, $.empty(), $.uglify()))
    .pipe(gulp.dest(config.public + 'scripts'))
})

gulp.task('js-filters-glob', function () {
  log('Compressing and copying filters')
  var filename = 'filters.js'

  return gulp.src(paths.js.filters_glob)
    .pipe($.concat(filename))
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.if(argv.development, $.empty(), $.ngAnnotate()))
    .pipe($.if(argv.development, $.empty(), $.uglify()))
    .pipe(gulp.dest(config.public + 'scripts'))
})

gulp.task('js-vendor-combined', function () {
  log('Compressing and copying third party scripts')
  var filename = 'vendor.js'

  return gulp.src(require('./' + paths.js.bower))
    .pipe($.concat(filename))
    .pipe($.rename({ suffix: '.min' }))
    .pipe(gulp.dest(config.public + 'scripts'))
})

// copy assets
gulp.task('assets', ['images', 'fonts', 'videos'])

gulp.task('images', function () {
  var out = config.public + 'images'

  log('Compressing and copying images')
  return gulp.src(paths.files.image_glob)
    .pipe($.cleanDest(out))
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(out))
})

gulp.task('fonts', function () {
  var out = config.public + 'styles/fonts'

  log('Copying fonts')
  return gulp.src(paths.files.font_glob)
    .pipe($.cleanDest(out))
    .pipe(gulp.dest(out))
})

gulp.task('videos', function () {
  var out = config.public + 'videos'

  log('Copying videos')
  return gulp.src(paths.files.video_glob)
    .pipe($.cleanDest(out))
    .pipe(gulp.dest(out))
})

gulp.task('lib', function () {
  var out = config.public + 'lib'

  log('Copying lib')
  return gulp.src('node_modules/@bower_components/**/**')
    .pipe($.cleanDest(out))
    .pipe(gulp.dest(out))
})

// nodemon server
gulp.task('nodemon', function () {
  var nodeOptions = {
    script: './bin/www',
    delayTime: 1,
    env: {
      'NODE_ENV': 'development'
    },
    watch: ['./routes', './index.js', './config', paths.js.watcher_glob, paths.jade.watcher_glob, paths.sass.watcher_glob],
    tasks: ['build']
  }

  $.nodemon(nodeOptions)
    .on('restart', function (ev) {
      log('*** nodemon restarted')
      log('files changed:\n' + ev)
    })
    .on('start', function () {
      log('*** nodemon started')
    })
    .on('crash', function () {
      log('*** nodemon crashed: script crashed for some reason')
    })
    .on('exit', function () {
      log('*** nodemon exited cleanly')
    })
})

gulp.task('browserify', function () {
  log('Bundling main script')
  var b = browserify()
  b.add(paths.js.root)

  return b.bundle()
    .on('success', $.util.log.bind($.util, 'Browserify Rebundled'))
    .on('error', $.util.log.bind($.util, 'Browserify Error: in browserify gulp task'))
    .pipe(source('index.js'))
    .pipe($.cleanDest(config.public + 'scripts'))
    .pipe(gulp.dest(config.public + 'scripts'))
})

gulp.task('compress', ['browserify'], function () {
  return gulp.src(config.public + 'scripts/index.js')
    .pipe($.if(argv.development, $.empty(), $.ngAnnotate()))
    .pipe($.if(argv.development, $.empty(), $.uglify()))
    .pipe(gulp.dest(config.public + 'scripts'))
})

gulp.task('setup', $.shell.task([
  'npm install'
]))

gulp.task('build', ['jade', 'sass', 'assets', 'compress'], function () {
  log('Building everything')

  var msg = {
    title: 'gulp build',
    subtitle: 'Deployed to the public folder',
    message: 'Running `gulp`'
  }

  log(msg)
})

gulp.task('production', ['build', 'lib', 'js-vendor-combined'])
gulp.task('serve', ['build', 'js-vendor-combined', 'nodemon'])

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log (msg) {
  if (typeof (msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]))
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg))
  }
}
