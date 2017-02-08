(function() {
  "use strict";

  angular.module('znote.controllers')
    .controller('AuthenticationController', AuthenticationController)

  AuthenticationController.$inject = ['$scope', '$state', 'Authentication', 'Notification', 'Refs', 'User', 'firebaseURL', '$firebaseAuth', '$firebaseObject'];

  function AuthenticationController ($scope, $state, Authentication, Notification, Refs, User, firebaseURL, $firebaseAuth, $firebaseObject) {
    var vm = this;
    vm.isLoggedIn = true;

    // function firebaseAuthLogin(provider) {
    //   authObj.$authWithOAuthPopup(provider).then(function(authData) {
    //     console.log(authData);
    //   })
    // }
    var authObj = $firebaseAuth(Refs.root);
    var ref = new Firebase(firebaseURL);

    // initialize and get the current authenticated state
    // init()

    // function init() {
    //   authObj.$onAuth(authDataCallback);
    //   if (authObj.$getAuth())
    //     vm.isLoggedIn = true;
    // }

    // function authDataCallback(authData) {
    //   if (authData) {
    //     var userObj = Authentication.buildUserObjectFromProviders(authData);
    //     vm.userObj = userObj;
    //     vm.isLoggedIn = true;

    //     var user = $firebaseObject(ref.child('users').child(userObj.uid));

    //     console.log('user', user);

    //     user.$loaded().then(function() {
    //       if (user.name == undefined) {
    //         var newUser = {};
    //         console.log('provider', userObj.provider);
    //         if (userObj.provider == "google") {
    //           newUser.name = userObj.display_name;
    //           newUser.image_URL = userObj.picture_img_url;
    //           newUser.email = userObj.email;
    //           newUser.id = userObj.id;
    //         }

    //         user.$ref().set(newUser);
    //       };
    //     }).catch(function(error) {
    //       console.error("Error:", error);
    //     });

    //   }
    //   else {
    //     console.error('error from authDataCallback', authData)
    //   }
    // }

    vm.Login = function(provider) {
      Authentication.login(provider, function(e, authData) {
        if (!e) {
          var payload = Authentication.buildUserObjectFromProviders(authData);
          // console.info('payload', payload);
          // sessionStorage.setItem("payload", angular.toJson(payload));
          User.create(payload, function (e, data) {
            console.log(data);
            console.error(e);
          });
          // User.remove(payload.uid, function(e, data) {
          //   console.error('e', e);
          //   console.info('data', data);
          // })

          // User.all(function(e, data) {
          //   console.info(data);
          //   console.error(e);
          // });

          // initialize and get the current authenticated state
          // init()

          // function init() {
          //   authObj.$onAuth(authDataCallback);
          //   if (authObj.$getAuth())
          //     vm.isLoggedIn = true;
          // }

          // function authDataCallback(payload) {
          //   if (payload) {
          //     console.info('yeet22');
          //     User.createUserAccount(payload);
          //   }
          // }

          //   Notification.notify('success', 'Hi, ' + userObj.display_name + '.');
          //     setTimeout(function() {
          //       Notification.notify('simple', 'Welcome to znote, get started by clicking on add note button.');
          //     }, 3000);
          //   // $state.go('notes');
          // });
        }
        else {
          if (e == 'Error: The user cancelled authentication.' || e.code == 'USER_CANCELLED' ) {
            Notification.notify('error', 'You cancelled authentication...');
          }
          else if (e == 'Error: Invalid authentication credentials provided.' || e.code == 'INVALID_CREDENTIALS') {
            Notification.notify('error', 'Invalid credentials');
          }
          else if (e.code == 'NETWORK_ERROR') {
            console.log('An error occurred while attempting to contact the authentication server.');
          }
          else if (e.code == 'UNKNOWN_ERROR') {
            console.log('An unknown error occurred');
          }
          else if (e.code == 'USER_DENIED') {
            console.log('The user did not authorize the application.');
          }
          else {
            console.error(e);
            Notification.notify('error', 'Login failed. Try again...(ツ)')
          }
        }
      });
     }

     vm.logout = function() {
      Authentication.logout();
      // $state.go('home');
      Notification.notify('sticky', 'Hi, ' + userObj.display_name + '.', true);
     }
  }
})()
