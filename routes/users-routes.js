var async    = require('async'),
    Firebase = require('firebase');

module.exports = function(router, rootRef) {
  var userRef = rootRef.child('users');

  router.get('/users', function(req, res) {
    userRef.once('value', function(snap) {
      console.log(snap.val())
      var users = snap.val(),
          result = [];

      if (users) {
        async.each(Object.keys(users), function(userId, cb) {
          var user = {
            uid: userId,
            id: users[userId].id,
            image_URL: users[userId].image_URL,
            fullname: users[userId].name,
            email: users[userId].email,
            name: {
              first: users[userId].first,
              last: users[userId].last
            }
          };

          result.push(user);
          cb();
        }, function(err) {
            if (err) return res.status(500).json(err);
            res.status(200).json(result);
        });
      }
      else {
        res.status(200).json(result);
      }
    });
  });

  router.get('/users/:id', function(req, res) {

  });

  return router;
};