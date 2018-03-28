"use strict";

angular
  .module('sugg.directives')
  .directive('preloader', ['$timeout', '$transitions',
    function($timeout, $transitions) {
      return {
        restrict: 'A',
        link: function(scope, element) {
          $transitions.onStart({}, function(trans) {
            $('#ui-view').html('');
            element.removeClass("hidden");
          });

          $transitions.onSuccess({}, function(trans) {
            $timeout(function() {
              element.addClass("hidden");
            }, 800);
          });

        }
      };
    }
]);