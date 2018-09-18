var async = require('async');
var four0four = require('./404')();

module.exports = function(router, rootRef) {
  var userRef = rootRef.child('users');

  function userToJSON(user, userId) {
    return {
      uid: userId,
      id: user.id,
      image_url: user.image_url,
      fullname: user.name,
      email: user.email,
      name: {
        first: user.first,
        last: user.last
      }
    };
  }

  router.get('/', function(req, res) {
    userRef.once('value', function(snap) {
      var users = snap.val();
      var result = [];

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

  router.post('/', function(req, res) {
    if (req.query.uid) {
      userRef
        .child(req.query.uid)
        .once('value', function(snap) {
          var user = snap.val();

          if (!user) return res.status(404).json({error:'no user found at node `' + userId + '`'});

          res.status(200).json(userToJSON(user, req.query.uid));
        });
    } else {
      res.status(400).json({ error: 'no user uid' });
    }
  });

  router.all('/*', four0four.notFoundMiddleware);

  return router;
};