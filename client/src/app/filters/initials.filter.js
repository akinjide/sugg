"use strict";

angular
  .module('sugg.filters')
  .filter('initials', [function() {
      return function(input) {
        return input.charAt(0);
      };
  }]);