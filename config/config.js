'use strict'

function load (variable) {
  if (!process.env[variable]) {
    return null
  }

  return process.env[variable]
}

var configurations = {
  test: {
    firebase: {
      rootRefUrl: '',
      serverUID: 'sugg-test',
      secretKey: ''
    },
    appLock: false,
    port: 1336
  },
  development: {
    firebase: {
      rootRefUrl: load('SUGG_FIREBASE_URI'),
      serverUID: load('SUGG_SERVER_UID'),
      secretKey: load('SUGG_SECRET_KEY')
    },
    appLock: load('SUGG_API_LOCK') || false,
    port: load('PORT') || 1338
  },
  production: {
    firebase: {
      rootRefUrl: load('SUGG_FIREBASE_URI'),
      serverUID: load('SUGG_SERVER_UID'),
      secretKey: load('SUGG_SECRET_KEY')
    },
    appLock: load('SUGG_API_LOCK'),
    PING_INTERVAL: 25 * 60 * 1000,
    port: load('PORT')
  }
}

module.exports = configurations[process.env.NODE_ENV || 'development']
