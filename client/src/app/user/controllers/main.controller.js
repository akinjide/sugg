(function() {
  "use strict";

  angular
    .module('znote.controllers')
    .controller('MainController', MainController)

  MainController.$inject = ['$scope', '$state'];

  function MainController ($scope, $state) {

    var vm = this;

    vm.navigateTo = function(state) {
      $state.go(state);
    };

    if (typeof(Storage) !== "undefined") {
      console.log("Code for localStorage/sessionStorage.")
    } else {
      console.log("Sorry! No Web Storage support..")
    }

    // localStorage.setItem("title", angular.toJson(storeItem));

    // var storage = localStorage.getItem("title", angular.fromJson(storeItem));
  }
})()