var userRoutes = require('./users-routes');

module.exports = function(app, config, rootRef) {

  app.get('/*', function(req, res) {
    res.sendFile('index.html');
  });

  app.use('/api', userRoutes(app, rootRef));
};