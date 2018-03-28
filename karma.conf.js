// Karma configuration
// Generated on Thu Jul 27 2017 15:56:59 GMT+0100 (WAT)

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'browserify'],
    files: [
      'client/public/lib/angular/angular.js',
      'client/public/lib/firebase/firebase.js',
      'client/public/lib/angularfire/dist/angularfire.js',
      'client/public/lib/angular-ui-router/release/angular-ui-router.js',
      'client/public/lib/lumx/dist/lumx.js',
      'client/public/lib/ngStorage/ngStorage.js',
      'client/public/lib/angular-loading-bar/build/loading-bar.js',
      'client/public/lib/mockfirebase/browser/mockfirebase.js',
      'client/public/lib/angular-mocks/angular-mocks.js',
      'client/src/app/**/*.js',
      'tests/client/unit/*.spec.js'
    ],
    reporters: ['progress'],
    browserify: {
      watch: true,
      debug: true,
      extensions: ['.js']
    },
    preprocessors: {
      'client/src/app/**/*.js': ['browserify']
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['PhantomJS']
  })
}
