'use strict'

angular
  .module('sugg.directives')
  .directive('routeTitle', ['$transitions', '$timeout',
    function ($transitions, $timeout) {
      return {
        link: function (scope, element) {
          var listener = function (trans) {
            var title = 'Welcome  — Sugg'
            var toData = trans.to().data
            var toParams = trans.params()

            if (toData && toData.title) {
              title = toData.title
            } else if (toParams.title) {
              title = toParams.title
            }

            $timeout(function () {
              element.text(title + ' — Sugg')
            }, 0, false)
          }

          $transitions.onSuccess({}, listener)
        }
      }
    }
  ])
