var userRoutes = require('./users-routes');
var express = require('express');
var router = express.Router();

module.exports = function(app, config, rootRef) {

  app.get('/', function(req, res) {
    res.sendFile('index.html');
  });

  app.use('/v1', userRoutes(router, rootRef));
};