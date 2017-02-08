'use strict';

function loadEnv(variable) {
  if (process.env[variable] === undefined) throw new Error('You must create an environment variable for ' + variable);

  return process.env[variable];
}

var test = {
  firebase : {
    rootRefUrl: "",
    serverUID: "",
    secretKey: ""
  }
};

var development = {
  firebase : {
    // future firebase url >> https://dazzling-fire-783.firebaseio.com/
    rootRefUrl : loadEnv('firebase_URL'),
    serverUID : loadEnv('server_uid'),
    secretKey : loadEnv('secretKey')
  },
  port: 1337 || loadEnv('PORT')
};

var production = {
  firebase: {
    // TODO: move env variables to heroku env
    rootRefUrl: "https://znote.firebaseio.com/",
    serverUID: "",
    secretKey: "l0cWwNTbFONgOQDgmQkPeFuiIT53tZkewuvwjwvm"
  },
  port: process.env.PORT || 1337
};

var config = {
  test: test,
  development: development,
  production: production
};

module.exports = config;
