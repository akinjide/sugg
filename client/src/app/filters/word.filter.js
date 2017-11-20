"use strict";

angular
  .module('znote.filters')
  .filter('splitWord', [function() {
      return function(input, position) {
        if (input) {
          var wordsArr = input.split(' ');

          return (position)
            ? (wordsArr[position])
              ? wordsArr[position]
              : ''
            : wordsArr[0]
        }
      };
    }]);