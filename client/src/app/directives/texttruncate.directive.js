'use strict';

angular
  .module('sugg.directives')
  .directive("ngTextTruncate", ["$compile", "ValidationServices", "CharBasedTruncation",
    function($compile, ValidationServices, CharBasedTruncation) {
      return {
          restrict: "A",
          scope: {
            text: "=ngTextTruncate",
            charsThreshould: "@ngTtCharsThreshold",
            customMoreLabel: "@ngTtMoreLabel",
            customLessLabel: "@ngTtLessLabel"
          },
          controller: function( $scope, $element, $attrs ) {
            $scope.toggleShow = function() {
              $scope.open = !$scope.open;
            };

            $scope.useToggling = $attrs.ngTtNoToggling === undefined;
          },
          link: function( $scope, $element, $attrs ) {
            $scope.open = false;

            ValidationServices.failIfWrongThreshouldConfig( $scope.charsThreshould, $scope.wordsThreshould );

            var CHARS_THRESHOLD = parseInt( $scope.charsThreshould );

            $scope.$watch("text", function() {
              $element.empty();

              if (CHARS_THRESHOLD) {
                if ($scope.text && CharBasedTruncation.truncationApplies($scope, CHARS_THRESHOLD)) {
                  CharBasedTruncation.applyTruncation(CHARS_THRESHOLD, $scope, $element);
                } else {
                  $element.append( $scope.text );
                }
              }
            });
          }
      };
  }])
  .factory("ValidationServices", function() {
    return {
      failIfWrongThreshouldConfig: function( firstThreshould, secondThreshould ) {
        if ( (! firstThreshould && ! secondThreshould) || (firstThreshould && secondThreshould) ) {
          throw "You must specify one, and only one, type of threshould (chars or words)";
        }
      }
    };
  })
  .factory( "CharBasedTruncation", [ "$compile", function( $compile ) {
    return {
      truncationApplies: function( $scope, threshould ) {
        return $scope.text.length > threshould;
      },

      applyTruncation: function(threshould, $scope, $element) {
        if ($scope.useToggling) {
          var el = angular.element("<span>" +
              $scope.text.substr( 0, threshould ) +
              "<span ng-show='!open'>...</span>" +
              "<span class='btn-link ngTruncateToggleText' " +
                "ng-click='toggleShow()'" +
                "ng-show='!open'>" +
                " " + ($scope.customMoreLabel ? $scope.customMoreLabel : "More") +
              "</span>" +
              "<span ng-show='open'>" +
                $scope.text.substring( threshould ) +
                "<span class='btn-link ngTruncateToggleText'" +
                  "ng-click='toggleShow()'" +
                  "ng-show='open'>" +
                  " " + ($scope.customLessLabel ? $scope.customLessLabel : "Less") +
                "</span>" +
              "</span>" +
            "</span>");
            $compile( el )( $scope );
            $element.append( el );
        } else {
          $element.append( $scope.text.substr( 0, threshould ) + "..." );
        }
      }
    };
  }])