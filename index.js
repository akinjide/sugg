global.t = require('moment');
global._ = require('lodash');

var express = require('express'),
  env = process.env.NODE_ENV || 'development',
  config = require('./config/config')[env],
  path = require('path'),
  fs = require('fs'),
  helmet = require('helmet'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  firebaseAuth = require('./bin/auth'),
  session = require('express-session'),
  FileStreamRotator = require('file-stream-rotator'),
  routes = require('./routes');

var app = express();

console.log('About to crank up node');
console.log('NODE_ENV=' + env);

function run(appDir, rootRef) {
  app.dir = appDir;

  // view engine setup
  // app.set('views', path.join(__dirname, 'views'));
  // app.set('view engine', 'jade');

  // set the static files location /public/img will be /img for users
  app.use(express.static(app.dir + '/client/public/'));

  app.use(logger('dev'));
  // get all data/stuffs from the body (POST) parameters
  // parse application/json adn support JSON-encoded bodies
  app.use(bodyParser.json());
  // parse application/vnd.api+json as json
  app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
  // URL-encoded bodies and parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  // perform an operation on each request to the server
  app.use(function(req, res, next) {
    // write each log request in development environment to a file
    if (env !== 'production')
      writeLog(req);

    // Tell the client what firebase to use
    res.cookie('rootRef', rootRef.toString());
    next();
  });

  var log_dir = path.join(__dirname, '/log'),
      req_log_dir = path.join(__dirname, '/log', '/routes'),
      check_log_dir = fs.existsSync(log_dir) || fs.mkdirSync(log_dir);

  function writeLog(req) {
    if (check_log_dir) {
      var filename = log_dir + '/routes/request.log',
        log = t().format('HH:MM') + ':::PATH ' + req.path + ' ' + req.method + ' ' + req.url + ' bytes: ' + req.socket.bytesRead + '\n';

      fs.appendFile(filename, log, function(err) {
        if (err) throw new Error(err);

        console.log('Request log updated \n', log);
      });
    }
  }

  if (check_log_dir) {
    var accessLogStream = FileStreamRotator.getStream({
      date_format: 'YYYYMMDD',
      filename: log_dir + '/access-%DATE%.log',
      frequency: 'weekly',
      verbose: false
    });
  }

  // Use helmet to secure Express Headers
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.disable('x-powered-by');

  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // res.setHeader('Access-Control-Allow-Headers', 'Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });

  routes(app, config, rootRef);


  /* error handler */

  // Error handling catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // development error handler will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      console.log(err.stack);
      // use morgan to log out on command line
      // combined logs the Apache style logs
      app.use(logger('combined'));

      res.status(err.status || 500)
          .json({
            message: err.message,
            error: err
          });
    });
  }

  // Production error handler no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(err.status || 500)
        .json({
          message: err.message,
          error: err,
          friendly_error: 'It\'s our fault, Something Broke!'
        });
  });
}

firebaseAuth.authWithCustomToken(function(err, rootRef) {
  run(process.cwd(), rootRef);
});

module.exports = app;