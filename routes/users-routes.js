var async = require('async');
var four0four = require('./404')();

module.exports = function(router, rootRef) {
  var userRef = rootRef.child('users');

  function userToJSON(user, userId) {
    return {
      uid: userId,
      id: user.id,
      image_URL: user.image_URL,
      fullname: user.name,
      email: user.email,
      name: {
        first: user.first,
        last: user.last
      }
    };
  }

  router.get('/users', function(req, res) {
    userRef.once('value', function(snap) {
      var users = snap.val(),
          result = [];

      if (users) {
        async.each(Object.keys(users), function(userId, cb) {
          user = userToJSON(users[userId], userId);

          result.push(user);
          cb();
        }, function(err) {
            if (err) return res.status(500).json(err);
            res.status(200).json(result);
        });
      } else {
        res.status(200).json(result);
      }
    });
  });

  router.get('/users/:id', function(req, res) {
    if (req.params.id) {
      userRef
        .child(req.params.id)
        .once('value', function(snap) {
          var user = snap.val();

          if (!user) return res.status(404).json({error:'No user found at node `' + userId + '`'});

          res.status(200).json(userToJSON(user, req.params.id));
        });
    } else {
      res.status(400).json({ error: 'No user Id' });
    }
  });

  router.get('/*', four0four.notFoundMiddleware);

  return router;
};