"use strict";

angular
  .module('sugg.directives')
  .directive('contenteditable', [function() {
    return {
      restrict: 'A',
      require: "?ngModel",
      link: function(scope, element, attr, ngModel) {
        function read() {
          ngModel.$setViewValue(element.html());
        }

        // model -> view
        ngModel.$render = function() {
          element.html(ngModel.$viewValue || "");
        }

        // view -> model
        element.bind('blur keyup change', function() {
          scope.$apply(read);
        });
      }
    };
  }]);