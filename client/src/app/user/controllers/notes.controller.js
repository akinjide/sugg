(function() {
  "use strict";

  angular.module('znote.controllers')
    .controller('notesController', notesController)

  notesController.$inject = ['$firebaseAuth', '$firebaseObject', '$state', 'firebaseURL', 'Authentication'];

  function notesController ($firebaseAuth, $firebaseObject, $state, firebaseURL, Authentication) {
    var vm = this;

  }
})()