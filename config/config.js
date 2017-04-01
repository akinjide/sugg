'use strict';

function load(variable) {
  if (process.env[variable] === undefined)
    return new Error('You must create an environment variable for ' + variable);

  return process.env[variable];
}

var test = {
  firebase: {
    rootRefUrl: "",
    serverUID: "znote",
    secretKey: ""
  },
  port: 1336
};

var development = {
  firebase : {
    rootRefUrl: load('fbURL'),
    serverUID: "znote-dev" || load('serveruid'),
    secretKey: load('secretKey')
  },
  port: 1338
};

var production = {
  firebase: {
    rootRefUrl: load('fbURL'),
    serverUID: load('serveruid'),
    secretKey: load('secretKey')
  },
  port: load('PORT') || 1338
};

var config = {
  test: test,
  development: development,
  production: production
};

module.exports = config;
