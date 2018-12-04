"use strict";

angular
  .module('sugg.filters')
  .filter('cut', [function() {
    return function(value, wordwise, max, isMobile, tail) {
      var message = 'Edit to view more';

      if (!value) {
        return '';
      }

      if (!isMobile) {
        message = 'Double click to view more';
      }

      max = parseInt(max, 10);
      if (!max) return value;
      if (value.length <= max) return value;

      value = value.substr(0, max);

      if (wordwise) {
          var lastspace = value.lastIndexOf(' ');

          if (lastspace !== -1) {
            //Also remove . and , so its gives a cleaner result.
            if (value.charAt(lastspace-1) === '.' || value.charAt(lastspace-1) === ',') {
              lastspace = lastspace - 1;
            }

            value = value.substr(0, lastspace);
          }
      }

      return value + (tail || '<span class="show-more">' + message + '</span>');
    };
  }]);
