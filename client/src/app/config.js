angular
  .module('sugg.config')
  .constant('version', '0.14')
  .constant('keys', {
    firebase: (function() {
      var hostname = window.location.host;
      var isLocal = /(^localhost)|(^znote-dev)/.test(hostname);
      var isProd =  /(sugg)/.test(hostname);
      var domain = 'firebaseio.com';
      var subdomain;

      if (isLocal) subdomain = 'znote';
      if (isProd) subdomain = 'sugg-1312a';

      return 'https://' + subdomain + '.' + domain + '/';
    }()),
  })
  .constant('featureFlag', {
    tags: false,
    upload: false,
    social: {
      twitter: false,
      facebook: true,
      google: true,
    },
    layout: false,
    search: true,
    profile: {
      deactivate: true,
      view: true,
    },
    share: true,
  });