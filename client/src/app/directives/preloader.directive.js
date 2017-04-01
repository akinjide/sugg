"use strict";

angular
  .module('znote.directives')
  .directive('preloader', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {
      return {
        restrict: 'A',
        link: function(scope, element) {
          $rootScope.$on('$stateChangeStart', function() {
            $('#ui-view').html('');
            element.removeClass("hidden");
          });

          $rootScope.$on('$stateChangeSuccess', function() {
            $timeout(function() {
              element.addClass("hidden");
            }, 800);
          });
        }
      };
    }
]);