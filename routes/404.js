module.exports = function () {
  return {
      notFoundMiddleware: notFoundMiddleware,
      send404: send404
  };

  function notFoundMiddleware(req, res, next) {
    send404(req, res, 'API endpoint not found');
  }

  function send404(req, res, description) {
    res
      .status(404)
      .send({
        status: 404,
        message: 'Not Found',
        description: description,
        url: req.url
      })
      .end();
  }
};