$(function() {

  $("#about").typed({
    strings: [
      "Znote keeps, your brain rests.",
      "Admit it your brain can’t keep every single note you want to remember, but Znote can, with no limit to how many note you can write and sync.",
      "I’m a web addict, Hang in there",
      "Keep calm and carry on. The obstacle is the path. . ."
    ],
    showCursor: false,
    typeSpeed: 10,
    loop: true
  });

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