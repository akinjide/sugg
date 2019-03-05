var G = require('gulp')
var browserify = require('browserify')
var argv = require('yargs').argv
var source = require('vinyl-source-stream')
var path = require('path')
var cssnano = require('cssnano')

var $ = {}
var config = {
  pkgs: {
    node: path.resolve(__dirname, 'package.json')
  },
  src: 'client/src/',
  public: 'client/public/',
  extensions: '{jpg,jpeg,gif,png,swf,flv,eot,svg,ttf,woff,woff2,otf,ico,htc,pdf,mp4,ogv,webm}'
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

var pkg = require(config.pkgs.node)

for (var dependencies in pkg.devDependencies) {
  if (/^gulp-/.test(dependencies)) {
    var name = dependencies.split('gulp-')[1].split('-').join('')
    $[name] = require(dependencies)
  }
}

// compile sass
var sass = G.series(
  function sassCombined () {
    log('Compiling Sass --> CSS')

    return G.src(paths.sass.combined_glob)
      .pipe($.sourcemaps.init())
      .pipe($.sass({
        outputStyle: 'compressed'
      }))
      .pipe($.autoprefixer(autoprefixerOptions))
      .pipe($.sourcemaps.write('.'))
      .pipe($.rename({
        suffix: '.min'
      }))
      .pipe($.cleandest(config.public + 'styles'))
      .pipe(G.dest(config.public + 'styles'))
  },
  function cssVendorCombined () {
    log('Compiling Vendor lib --> CSS')

    return G.src(require('./' + paths.css.vendor))
      .pipe($.concat('vendor.css'))
      .pipe($.sourcemaps.init())
      .pipe($.postcss([
        cssnano()
      ]))
      .pipe($.sourcemaps.write('.'))
      .pipe($.rename({
        suffix: '.min'
      }))
      .pipe($.cleandest(config.public + 'styles'))
      .pipe(G.dest(config.public + 'styles'))
  }
)

// compile jade
var jade = G.series(
  function jadePartials () {
    log('Compiling Jade --> HTML')

    return G.src(paths.jade.partials_glob)
      .pipe($.cleandest(config.public + 'views'))
      .pipe($.jade())
      .pipe($.htmlmin({
        collapseWhitespace: true,
        removeComments: true
      }))
      .pipe(G.dest(config.public + 'views'))
  },
  G.parallel(
    function jadeRoot () {
      return G.src(paths.jade.root)
        .pipe($.jade())
        .pipe(G.dest(config.public))
    },
    function jadeFour0Four () {
      return G.src(paths.jade.four0four)
        .pipe($.jade())
        .pipe(G.dest(config.public))
    }
  )
)

// compile javascripts
var javascripts = G.series(
  function javascriptVendorCombined () {
    log('Compressing and copying third party scripts')

    return G.src(require('./' + paths.js.bower))
      .pipe($.concat('vendor.js'))
      .pipe($.rename({
        suffix: '.min'
      }))
      .pipe(G.dest(config.public + 'scripts'))
  },
  G.parallel(
    function javascriptController () {
      log('Compressing and copying controllers')

      return G.src(paths.js.controllers_glob)
        .pipe($.concat('controllers.js'))
        .pipe($.rename({
          suffix: '.min'
        }))
        .pipe($.if(argv.development, $.empty(), $.ngannotate()))
        .pipe($.if(argv.development, $.empty(), $.uglify()))
        .pipe(G.dest(config.public + 'scripts'))
    },
    function javascriptDirectives () {
      log('Compressing and copying directives')

      return G.src(paths.js.directives_glob)
        .pipe($.concat('directives.js'))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.if(argv.development, $.empty(), $.ngannotate()))
        .pipe($.if(argv.development, $.empty(), $.uglify()))
        .pipe(G.dest(config.public + 'scripts'))
    },
    function javascriptServices () {
      log('Compressing and copying services')

      return G.src(paths.js.services_glob)
        .pipe($.concat('services.js'))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.if(argv.development, $.empty(), $.ngannotate()))
        .pipe($.if(argv.development, $.empty(), $.uglify()))
        .pipe(G.dest(config.public + 'scripts'))
    },
    function javascriptFilters () {
      log('Compressing and copying filters')

      return G.src(paths.js.filters_glob)
        .pipe($.concat('filters.js'))
        .pipe($.rename({
          suffix: '.min'
        }))
        .pipe($.if(argv.development, $.empty(), $.ngannotate()))
        .pipe($.if(argv.development, $.empty(), $.uglify()))
        .pipe(G.dest(config.public + 'scripts'))
    }
  )
)

// copy assets
var assets = G.series(
  function lib () {
    log('Copying lib')

    return G.src('node_modules/@bower_components/**/**')
      .pipe($.cleandest(config.public + 'lib'))
      .pipe(G.dest(config.public + 'lib'))
  },
  G.parallel(
    function images () {
      log('Compressing and copying images')

      return G.src(paths.files.image_glob)
        .pipe($.cleandest(config.public + 'images'))
        .pipe($.cache($.imagemin({
          optimizationLevel: 3,
          progressive: true,
          interlaced: true
        })))
        .pipe(G.dest(config.public + 'images'))
    },
    function videos () {
      log('Copying videos')

      return G.src(paths.files.video_glob)
        .pipe($.cleandest(config.public + 'videos'))
        .pipe(G.dest(config.public + 'videos'))
    },
    function fonts () {
      log('Copying fonts')

      return G.src(paths.files.font_glob)
        .pipe($.cleandest(config.public + 'styles/fonts'))
        .pipe(G.dest(config.public + 'styles/fonts'))
    }
  )
)

var compress = G.series(
  function bundle () {
    var b = browserify()
    log('Bundling main script')

    b.add(paths.js.root)

    return b.bundle()
      .on('success', $.util.log.bind($.util, 'Browserify Rebundled'))
      .on('error', $.util.log.bind($.util, 'Browserify Error: in browserify gulp task'))
      .pipe(source('index.js'))
      .pipe($.cleandest(config.public + 'scripts'))
      .pipe(G.dest(config.public + 'scripts'))
  },
  function compression () {
    return G.src(config.public + 'scripts/index.js')
      .pipe($.if(argv.development, $.empty(), $.ngannotate()))
      .pipe($.if(argv.development, $.empty(), $.uglify()))
      .pipe(G.dest(config.public + 'scripts'))
  }
)

// nodemon server
function nodemon (callback) {
  var nodeOptions = {
    script: './bin/www',
    delayTime: 1,
    env: {
      'NODE_ENV': 'development'
    },
    watch: 'client/src', // switch to gulp watch
    tasks: ['build'],
    done: callback
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
}

G.task('sass', sass)
G.task('jade', jade)
G.task('javascripts', javascripts)
G.task('assets', assets)
G.task('nodemon', nodemon)
G.task('compress', compress)

var build = G.series(
  assets,
  jade,
  sass,
  javascripts,
  compress,
  function build (callback) {
    log('Building everything')
    log({
      title: 'gulp build',
      subtitle: 'Deployed to the public folder',
      message: 'Running `gulp`'
    })

    callback()
  }
)

var serve = G.series(
  build,
  nodemon,
  function serve (callback) {
    log('Serving *')
    log({
      title: 'gulp serve',
      subtitle: 'Serving public folder',
      message: 'Running `gulp`'
    })

    callback()
  }
)

var production = G.series(
  build,
  function (callback) {
    log('Building everything')
    log({
      title: 'gulp production',
      subtitle: 'Deployed to the public folder',
      message: 'Running `gulp`'
    })

    callback()
  }
)

// G.watch('client/src/**/*', { events: 'all', delay: 2000 }, build)

exports.production = production
exports.serve = serve
exports.build = build

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
