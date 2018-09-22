var firebaseAuth = require('../bin/auth');

exports.addSugg = function(req, res, next) {
  req.sugg = req.sugg || {};
  res.sugg = res.sugg || {};
  next();
}

exports.extract = function(req, res, next)  {
  if (req.headers && req.headers.authorization) {
    var token = req.headers.authorization.split(' ')[1];

    firebaseAuth.authWithCustomToken(token, function(error, data, rootRef) {
      if (error) return res.send(422);
      req.sugg.ref = rootRef;
      next();
    });
  } else {
    return res.send(403);
  }
}

exports.hasAuthorization = function(role) {
  return function(req, res, next) {
    if (_.intersection(req.user.roles, role).length) {
      return next();
    } else {
      return res.send(403);
    }
  };
};


exports.userToJSON = function(user, uid) {
  return {
    uid: uid,
    id: user.id,
    image_url: user.image_url,
    full_name: user.name,
    email: user.email,
    name: {
      first: user.first,
      last: user.last
    }
  };
}

exports.send404 = function(req, res, description) {
  res.status(404).send({
    status: 404,
    message: 'Not Found',
    description: description,
    url: req.url
  }).end();
}