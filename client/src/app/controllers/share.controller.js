(function() {
  "use strict";

  function ShareController ($transition$, shareNote) {
    var vm = this;
    vm.Share = {
      'note': {}
    };

    /////////////////////

    activate();


    function activate() {
      vm.Share = {
        'note': {
          'content': shareNote[0].content,
          'title': shareNote[1].title,
          'metadata': {
           'created': shareNote[1].created,
            'updated': shareNote[1].updated
          },
          'settings': {
            'color': shareNote[0].settings.color
          }
        }
      };
    }
  }

  angular
    .module('sugg.controllers')
    .controller('ShareController', ShareController);

  ShareController.$inject = ['$transition$', 'shareNote'];
})();