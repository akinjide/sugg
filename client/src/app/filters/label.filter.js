"use strict";

angular
  .module('sugg.filters')
  .filter('labelParse', ['Label', function(Label) {
    var title = null;
    var cache = {};

    getTitle.$stateful = true;

    function filterFunc(title) {
      return title
    }

    function getTitle (input) {
      if (title == null) {
        Label.find(input).then(function(data) {

          title = data.title;
          cache[input] = title;
        });
      } else {
        return filterFunc(cache[input]);
      }
    };

    return getTitle;
  }]);