var express = require('express');
var router = express.Router();
var four0four = require('./404')();
var path = require('path');

module.exports = function(app, config, rootRef) {
  //app.use('/v1/users', require('./users')(router, rootRef));
  //app.use('/v1/notes', require('./notes')(router, rootRef));
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/public/index.html'))
  });
};