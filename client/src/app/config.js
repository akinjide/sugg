angular
  .module('sugg.config')
  .constant('version', '0.22')
  .constant('keys', {
    firebase: (function() {
      var hostname = window.location.host;
      var isLocal = /(^localhost)/.test(hostname);
      var isProd =  /(sugg)/.test(hostname);
      var domain = 'firebaseio.com';
      var subdomain = 'znote';

      if (isLocal) console.log('isLocal', isLocal);
      if (isProd) console.log('isProd', isProd);

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
    notification: true
  });