var path = require('path');
var async = require('async');
var express = require('express');
var firebaseAuth = require('../bin/auth');
var middleware = require('./middleware');
var router = express.Router();


module.exports = function(app, config) {
  app.use('/v1', (function() {
    router.post('/auth/token', middleware.addSugg, function(req, res) {
      var valid = _.every(['email', 'scope'], function(required) {
        if (req.body[required]) return true;
        return false;
      });

      if (!valid) {
        return res.send(403);
      }

      firebaseAuth.generateToken(req.body, function(error, token) {
        if (error) return res.send(500);
        res.status(200).json(token);
      });
    });

    var prepareRequest = [
      middleware.addSugg,
      middleware.extract
    ];


    router.route('/users')
      .get(prepareRequest, function(req, res) {
        var ref = req.sugg.ref;

        ref.child('users').once('value', function(snap) {
          var users = snap.val();
          var result = [];

          if (users) {
            async.each(
              _.keys(users),
              function(id, callback) {
                result.push(
                  middleware.userToJSON(users[id], id)
                );
                callback();
              }, function(error) {
                if (error) return res.send(500);
                res.status(200).json(result);
              }
            );
          } else {
            res.status(200).json(result);
          }
        });
      })
      .post(prepareRequest, function(req, res) {
        res.send(501);
      })
      .put(prepareRequest, function(req, res) {
        res.send(501);
      });

    router.route('/users/:uid')
      .get(prepareRequest, function(req, res) {
        var ref = req.sugg.ref;

        if (req.params.uid) {
          ref.child('users').child(req.params.uid)
            .once('value', function(snap) {
              var user = snap.val();
              if (!user) return res.send(404);
              res.status(200).json(middleware.userToJSON(user, req.params.uid));
            });
        } else {
          res.send(400);
        }
      })
      .post(prepareRequest, function(req, res) {
        res.send(501);
      })
      .put(prepareRequest, function(req, res) {
        res.send(501);
      });

    router.route('/notes')
      .get(prepareRequest, function(req, res) {
        var ref = req.sugg.ref;

        ref.child('notes').once('value', function(snap) {
          res.status(200).json(snap.val());
        });
      })
      .post(prepareRequest, function(req, res) {
        res.send(501);
      })
      .put(prepareRequest, function(req, res) {
        res.send(501);
      });

    router.all('/*', function(req, res, next) {
      middleware.send404(req, res, 'API endpoint not found');
    });

    return router
  }()));

  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/public/index.html'))
  });
};