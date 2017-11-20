$(function() {
  $("#znote__txtarea").click(function() {
    $("#znote__txtarea").css({
      'height': '200px'
    });
  });

//   IE9+
//   $('.znote-checkbox').on('click', function() {
//
//      Clicking on the parent row will toggle the child check box
//      $('input[type=checkbox]', this).prop('checked', function(i, checked){
//         return !checked
//      })
//
//     Add selected class when box is checked
//     if($('input[type=checkbox]', this).prop('checked'))
//       $(this).addClass('selected');
//     else
//       $(this).removeClass('selected');
//   });

});