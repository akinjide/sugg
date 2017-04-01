"use strict";

angular
  .module('znote.directives')
  .directive('listView', ['$rootScope', function($rootScope) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        console.log(attr, element, scope, $rootScope);

//         Watch for when the value bound to isOpen changes
//         When it changes trigger a slideToggle
        $rootScope.$watch('listView', function(newIsOpenVal, oldIsOpenVal) {
          console.log(newIsOpenVal, oldIsOpenVal);
//           if (newIsOpenVal !== oldIsOpenVal)
//             element.removeClass('row-masonry row-masonry-xl-5 row-masonry-lg-4 row-masonry-md-3 row-masonry-sm-2');
//             element.addClass('row-masonry row-masonry-xl-5 row-masonry-lg-4 row-masonry-md-3 row-masonry-sm-2');
          element.toggleClass('list-view');
        });
      }
    };
  }]);