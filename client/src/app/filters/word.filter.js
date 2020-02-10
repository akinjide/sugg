'use strict'

angular
  .module('sugg.filters')
  .filter('splitWord', [function () {
    return function (input, position) {
      if (input) {
        var wordsArr = input.split(' ')

        if (position) {
          if (wordsArr[position]) {
            return wordsArr[position]
          }

          return ''
        }

        return wordsArr[0]
      }
    }
  }])
