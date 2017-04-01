var express = require('express');
var router = express.Router();
var four0four = require('./404')();

var userRoutes = require('./users-routes');
var noteRoutes = require('./notes-routes');

module.exports = function(app, config, rootRef) {
  // Any invalid calls for templateUrls are under app/* and should return 404
  app.use('/app/*', function(req, res, next) {
      four0four.send404(req, res);
  });

  app.use('/v1', userRoutes(router, rootRef));
//   app.use('/v1', noteRoutes(router, rootRef));

  app.use('/*', express.static('./client/public/index.html'));
//   app.get('/*',function(req, res){
//     res.sendFile("index.html",{ root:'./client/public'});
//   });
};