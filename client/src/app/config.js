angular
  .module('sugg.config')
  .constant('version', '0.14')
  .constant('keys', {
    firebase: 'https://znote.firebaseio.com/',
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