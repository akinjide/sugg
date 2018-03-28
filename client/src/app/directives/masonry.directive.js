"use strict";

angular
  .module('sugg.directives')
  .directive('masonry', ['$timeout',
    function($timeout) {
      return {
      restrict: 'A',
        link: function(scope, elem, attrs) {
          if (attrs.class.includes('masonry-brick')) {
            console.log(attrs.class)
            scope.$watch(function() {
              return elem[0].children.length
            }, function(newVal) {
              $timeout(function() {
                elem.masonry('reloadItems');
                elem.masonry();
              });
            });

            elem.masonry({
              itemSelector: '.col-masonry',
              columnWidth: 100,
              percentPosition: true,
              gutter: 10
            });

            scope.masonry = elem.data('masonry');
          }
        }
      };
    }
]);