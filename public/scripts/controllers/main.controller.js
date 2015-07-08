app.controller('mainController', ['$scope', 'LxNotificationService', function($scope, LxNotificationService){

  if (typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
  } else {
    // Sorry! No Web Storage support..
  }

var app = true;

  $scope.alllist = [];
  console.log('tst', $scope.newlist)
  if (app === true) {
    $scope.add = function () {
    LxNotificationService.error('Lorem Ipsum');
      console.log('hit')
      $scope.alllist.push({
        title: $scope.newlist,
      });
      console.log('array', $scope.alllist)
      var storeItem = $scope.alllist;

      localStorage.setItem("title", angular.toJson(storeItem));

      var storage = localStorage.getItem("title", angular.fromJson(storeItem));

      $scope.newlist = '';

      console.log('localStorage', (storage));
    }
  } else {

  }

}])