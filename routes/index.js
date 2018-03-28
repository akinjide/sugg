var express = require('express');
var router = express.Router();
var four0four = require('./404')();
var path = require('path');

var userRoutes = require('./users-routes');
var noteRoutes = require('./notes-routes');

module.exports = function(app, config, rootRef) {
  app.use('/v1/users', userRoutes(router, rootRef));
  app.use('/v1/notes', noteRoutes(router, rootRef));
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/public/index.html'))
  });
};