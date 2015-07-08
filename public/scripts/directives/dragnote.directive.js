app.directive('dragNote', ['$document', function($document){
  // Runs during compile
  return {
    link: function(scope, element, attr) {
      var startX = 0,
          startY = 0,
          x      = 0,
          y      = 0;

      element.css({
        // position: 'relative',
        cursor: 'pointer',
        // top: '120px',
        // left: '200px'
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
        x = event.pageY - startX;
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
}]);