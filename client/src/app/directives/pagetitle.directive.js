"use strict";

angular
  .module('znote.directives')
  .directive('routeTitle', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {
      return {
        link: function(scope, element) {
          var listener = function(event, toState, toParams) {
            var title = 'Znote | Welcome';

            if (toState.data && toState.data.title) {
              title = toState.data.title;
            } else if (toParams.title) {
              title = toParams.title;
            }

            $timeout(function() {
              element.text(title + ' | Znote');
            }, 0, false);

          };

          $rootScope.$on('$stateChangeSuccess', listener);
        }
      };
    }
]);