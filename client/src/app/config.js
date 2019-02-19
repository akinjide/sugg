angular
  .module('sugg.config')
  .constant('SUGG_APP_VERSION', '0.42')
  .constant('SUGG_KEYS', {
    r: (function() {
      var hostname = window.location.host;
      var isLocal = /(^localhost)/.test(hostname);
      var isProd =  /(sugg)/.test(hostname);
      var domain = 'firebaseio.com';
      var subdomain;

      if (isLocal) {
        subdomain = 'znote';
        console.log('isLocal', isLocal);
      }

      if (isProd) {
        subdomain = 'sugg-230817';
        console.log('isProd', isProd);
      }

      return 'https://' + subdomain + '.' + domain + '/';
    }()),
    f: (function() {
      var hostname = window.location.host;
      var isLocal = /(^localhost)/.test(hostname);
      var isProd =  /(sugg)/.test(hostname);
      var hashes;

      if (isLocal) {
        hashes = {
          one: 'eyJhcGlLZXkiOiJBSXphU3lCNW5wYkhHdUhldmRzWUlOREZIQXNhM0xqd3ZxV0ZIWk0iLCJhdXRoRG9tYWluIjoiem5vdGUuZmlyZWJhc2Vh',
          two: 'cHAuY29tIiwiZGF0YWJhc2VVUkwiOiJodHRwczovL3pub3RlLmZpcmViYXNlaW8uY29tIiwicHJvamVjdElkIjoiZmlyZWJhc2Utem5vdGUiLCJzdG9yYWd',
          three: 'lQnVja2V0IjoiZmlyZWJhc2Utem5vdGUuYXBwc3BvdC5jb20iLCJtZXNzYWdpbmdTZW5kZXJJZCI6IjgwOTI4MDI1MTU5NCJ9',
        };
      }

      if (isProd) {
        hashes = {
          one: 'eyJhcGlLZXkiOiJBSXphU3lCVXNibmpnX3NlR0J3UUlmUEF6SzUtaDQxVHJIc1R3NzgiLCJhdXRoRG9tYWluIjoic3VnZy0yMzA4MTcuZml',
          two: 'yZWJhc2VhcHAuY29tIiwiZGF0YWJhc2VVUkwiOiJodHRwczovL3N1Z2ctMjMwODE3LmZpcmViYXNlaW8uY29tIiwicHJvamVjdElkIjoic3VnZy0yMzA4MTci',
          three: 'LCJzdG9yYWdlQnVja2V0Ijoic3VnZy0yMzA4MTcuYXBwc3BvdC5jb20iLCJtZXNzYWdpbmdTZW5kZXJJZCI6IjczNjc3OTIyMjM4NiJ9',
        };
      }

      return Object.keys(hashes)
        .map(function(key) {
          return hashes[key];
        });
    }())
  })
  .constant('SUGG_FEATURE_FLAG', {
    note: {
      tags: false,
      upload: true,
      expand: false
    },
    navigation: {
      layout: true,
      search: true,
      profile: {
        deactivate: true,
        view: true
      }
    },
    login: {
      social: {
        twitter: false,
        facebook: true,
        google: true
      }
    },
    core: {
      notification: false,
      maintenance: true
    },
    share: true
  })
  .constant('SUGG_COMMON', {
    MAX_FILE_SIZE: 10 * 1000000, // 10MB
    COLORS: [
      'white',
      'blue',
      'red',
      'orange',
      'yellow',
      'blueberry',
      'pink',
      'brown',
      'grey',
      'teal',
      'green',
      'lavender',
      'thistle',
      'pigeon',
      'tangerine',
      'sage',
      'charm',
      'downy',
    ]
  });
