'use strict'

angular
  .module('sugg.directives')
  .directive('preloader', ['$timeout', '$transitions',
    function ($timeout, $transitions) {
      return {
        restrict: 'A',
        link: function (scope, element) {
          $transitions.onStart({}, function () {
            $('#ui-view').html('')
            element.removeClass('hidden')
          })

          $transitions.onSuccess({}, function () {
            $timeout(function () {
              element.addClass('hidden')
            }, 800)
          })
        }
      }
    }
  ])
