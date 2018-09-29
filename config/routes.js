var path = require('path');
var async = require('async');
var express = require('express');
var firebaseAuth = require('../bin/auth');
var middleware = require('./middleware');
var router = express.Router();


module.exports = function(app, config) {
  var suggStack = [
    middleware.allowAccess,
    middleware.addSugg
  ]

  app.use('/v1', (function() {
    router.get('/ping', function(req, res) {
      res.send('PONG');
    });

    router.post('/auth/token', suggStack, function(req, res) {
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

    var httpBearerStack = suggStack.concat([
      middleware.bearer
    ]);

    router.route('/users')
      .get(httpBearerStack, function(req, res) {
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
      .post(httpBearerStack, function(req, res) {
        res.send(501);
      })
      .put(httpBearerStack, function(req, res) {
        res.send(501);
      });

    router.route('/users/:uid')
      .get(httpBearerStack, function(req, res) {
        var ref = req.sugg.ref;

        if (req.params.uid) {
          async.waterfall([
            function(callback) {
              ref.child('users').child(req.params.uid)
                .once('value', function(snap) {
                  var user = snap.val();

                  if (!user) return callback(user);
                  callback(null, user);
                }, function(error) {
                  callback(error);
                });
            },
            function(user, callback) {
              var notes = [];
              var step = 0;

              _.each(user.metadata, function(metadata, key) {
                ref.child('notes').child(metadata.note_id)
                  .once('value', function(snap) {
                    var note = snap.val();

                    if (note) {
                      notes.push({
                        content: note.content,
                        lang: note.lang,
                        settings: note.settings,
                        created: metadata.created,
                        note_id: metadata.note_id,
                        title: metadata.title,
                        updated: metadata.updated,
                      })
                    }

                    step++;

                    if (_.keys(user.metadata).length == step) {
                      callback(null, {
                        user: user,
                        notes: notes
                      });
                    }
                  }, function(error) {
                    callback(error);
                  });
              });
            }
          ], function(error, result) {
            if (error) {
              return res.send(204);
            }

            res.status(200).json({ user: middleware.userToJSON(result.user, req.params.uid), notes: result.notes });
          });
        } else {
          res.send(400);
        }
      })
      .post(httpBearerStack, function(req, res) {
        res.send(501);
      })
      .put(httpBearerStack, function(req, res) {
        res.send(501);
      });

    router.route('/notes')
      .get(httpBearerStack, function(req, res) {
        var ref = req.sugg.ref;

        ref.child('notes').once('value', function(snap) {
          res.status(200).json(snap.val());
        });
      })
      .post(httpBearerStack, function(req, res) {
        res.send(501);
      })
      .put(httpBearerStack, function(req, res) {
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