"use strict";

angular
  .module('znote.directives')
  .filter('splitWord', [function() {
      return function(input, position) {
        if (input) {
          var wordsArr = input.split(' ');

          if (position) {
            if (wordsArr[position])
              return wordsArr[position];
            else
              return '';
          } else {
            return wordsArr[0];
          }
        }
      };
    }]);