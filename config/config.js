'use strict';

function load(variable) {
  return (process.env[variable] === undefined)
    ? new Error(variable + 'is required')
    : process.env[variable]
}

var test = {
  firebase: {
    rootRefUrl: "",
    serverUID: "sugg",
    secretKey: ""
  },
  port: 1336
};

var development = {
  firebase : {
    rootRefUrl: load('fb_uri'),
    serverUID: "sugg-dev" || load('server_uid'),
    secretKey: load('secret_key')
  },
  port: 1338
};

var production = {
  firebase: {
    rootRefUrl: load('fb_uri'),
    serverUID: load('server_uid'),
    secretKey: load('secret_key')
  },
  port: load('PORT') || 1338
};

var config = {
  test: test,
  development: development,
  production: production
};

module.exports = config;