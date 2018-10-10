"use strict";

angular
  .module('sugg.filters')
  .filter('initials', [function() {
      return function(input) {
        if (input) {
          return input.charAt(0);
        }

        return '';
      };
  }]);