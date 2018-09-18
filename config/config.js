'use strict';

function load(variable) {
  return (process.env[variable] === undefined)
    ? new Error(variable + 'is required')
    : process.env[variable]
}

module.exports = {
  test: {
    firebase: {
      rootRefUrl: "",
      serverUID: "sugg-test",
      secretKey: ""
    },
    port: 1336
  },
  development: {
    firebase : {
      rootRefUrl: load('fb_uri'),
      serverUID: "sugg-dev" || load('server_uid'),
      secretKey: load('secret_key')
    },
    port: 1338
  },
  production: {
    firebase: {
      rootRefUrl: load('fb_uri'),
      serverUID: load('server_uid'),
      secretKey: load('secret_key')
    },
    port: load('PORT') || 1338
  }
};