$(document).ready(function(){
  var myDataRef = new Firebase('https://znote.firebaseio.com/');
  $('#key').click(function (e) {
    var text = $('#texts').val();
    var name = $('#names').val();

    myDataRef.push({ name: name, text: text });
    var ppp = myDataRef.child('attendance');
    ppp.push({ name: name, text: text })
    $('#texts').val('');
  });

  myDataRef.on('child_added', function(snapshot) {
    var message  = snapshot.val();
    displayChatMessage(message.name, message.text);
  });

  function displayChatMessage(name, text) {
    $('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#messagesDiv'));
    // $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
  };
})