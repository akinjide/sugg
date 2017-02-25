angular.module('znote.directives')
  .directive('dragNote', ['$document', function($document){
    // Runs during compile
    return {
      link: function(scope, element, attr) {
        var startX = 0,
            startY = 0,
            x      = 0,
            y      = 0;

        element.css({
          cursor: 'pointer',
        });

        element.on('mousedown', function(event) {
          //prevent default dragging of selected content
          event.preventDefault();
          startX = event.pageX - x;
          startY = event.pageY - y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });

        function mousemove(event) {
          y = event.pageY - startY;
          x = event.pageX - startX;
          console.log(x, y);
          console.log(startX, startY)
          element.css({
            top: y + 'px',
            left: x + 'px'
          });
        };

        function mouseup() {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        };
      }
    };
  }])
  .directive('demo-greet', function($parse) {
    return {
      restrict: 'ACE',
      link: function linkFn(scope, lElement, attrs) {
        console.log('LinkingFn', scope, lElement, attts);
        scope.$watch('name', function(name) {
          lElement.text('Hello ' + name + '!');
        })
        attrs.demoGreet

        lElement.bind('click', function() {
          console.log('click');
          scope.name = 'abc!';
          scope.$apply(function() {
            scope.name = 'abc!'
            $parse(attrs.demoGreet).assign(scope, 'abc')
          })
        })
      }
    }
  });