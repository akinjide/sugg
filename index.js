global.t = require('moment');
global._ = require('lodash');

var express = require('express');
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
var path = require('path');
var fs = require('fs');
var helmet = require('helmet');
var request = require('request');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var firebaseAuth = require('./bin/auth');
var session = require('express-session');
var routes = require('./config/routes');

var app = express();


console.log('About to crank up node');
console.log('NODE_ENV=' + env);

function run(appDir, rootRef) {
  app.dir = appDir;
  app.sugg = app.sugg || {};

  // set the static files location client/public/img will be /img for users
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
    if (env !== 'production') {
      writeLog(req);
    }

    // Tell the client what firebase to use
    res.cookie('sugg-ref', rootRef.toString());
    next();
  });

  var logDirectory = path.join(__dirname, '/logs');
  var islogDirectory = fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

  function writeLog(req) {
    if (islogDirectory) {
      var filename = logDirectory + '/request.log';
      var log = '[' + t().format('HH:MM') + '] path: ' + req.path + ' ' + req.method + ' ' + req.url + ' bytes: ' + req.socket.bytesRead + '\n';

      fs.appendFile(filename, log, function(error) {
        if (error) {
          console.log(error);
        }
      });
    }
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
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });

  routes(app, config);

  app.sugg.keepAlive = keepAlive;
  function keepAlive() {
    var PING_INTERVAL =  1 * 60 * 1000;

    return setInterval(function() {
      request('http://www.sugg.xyz/v1/ping', function(error, response, body) {
        console.log('PING, %s=%s', PING_INTERVAL, body);
      });
    }, PING_INTERVAL);
  }

  // Error handling catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var error = new Error('Not Found');
    error.status = 404;
    next(error);
  });

  // development error handler will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(error, req, res, next) {
      console.log(error.stack);
      // use morgan to log out on command line
      // combined logs the Apache style logs
      app.use(logger('combined'));

      res.status(error.status || 500)
          .json({
            message: error.message,
            error: error
          });
    });
  }

  // Production error handler no stacktraces leaked to user
  app.use(function(error, req, res, next) {
    console.log(error.stack);
    res.status(error.status || 500)
        .json({
          message: error.message,
          error: error,
          friendly_error: 'It\'s our fault, Something Broke!'
        });
  });
}

run(process.cwd(), firebaseAuth.rootRef);

module.exports = app;