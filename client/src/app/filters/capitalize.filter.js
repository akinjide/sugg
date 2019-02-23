'use strict'

angular
  .module('sugg.filters')
  .filter('capitalize', [function () {
    return function (input, all) {
      var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/

      if (input) {
        return input.replace(reg, function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        })
      }

      return ''
    }
  }])
