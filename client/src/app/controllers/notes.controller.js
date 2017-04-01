(function() {
  "use strict";

  angular
    .module('znote.controllers')
    .controller('NotesController', NotesController)

  NotesController.$inject = ['Refs', '$firebaseArray', '$q', 'Note', '$state', '$rootScope', '$timeout', 'Notification', 'cfpLoadingBar', 'LxDropdownService', '$scope'];

  function NotesController (Refs, $firebaseArray, $q, Note, $state, $rootScope, $timeout, Notification, cfpLoadingBar, LxDropdownService, $scope) {
    var vm = this;

    vm.isLoggedIn = $rootScope.isLoggedIn;
    vm.note = {
      title: '',
      trix: '',
      color: ''
    };
    vm.NoteColors = ['white', 'blue', 'red', 'orange', 'yellow', 'grey', 'teal', 'green'];

    vm.Remove = Remove;
    vm.Create = Create;

    if (vm.isLoggedIn) {
      vm.currentUser = $rootScope.currentUser;
      var Notes = $firebaseArray(Refs.notes);
      var metadata = $firebaseArray(Refs.users.child(vm.currentUser.$id).child('metadata'));

      ///////////////////////
      // WATCHERS
      //////////////////////

      Notes.$watch(function(e) {
        if (e.event === 'child_removed') {
          init();
        }
      });

      metadata.$watch(function(e) {
        if (e.event === 'child_changed') {
          init();
        }
      });
    }

    /////////////////////

    cfpLoadingBar.start();
    activate();

//     $rootScope.$on('$viewContentLoaded', function(event, toState, toParams, fromState, fromParams) {});

//     $scope.$watch(angular.bind(this, function () {
//       return this.Notes; // `this` IS the `this` above!!
//     }), function (newVal, oldVal) {
//       // now we will pickup changes to newVal and oldVal
//       if (!_.isEmpty(newVal)) {
//         if (_.eq(newVal.length, 0)) {
//           console.log('yeet')
//           $timeout(function() {
//             Notification.notify('info', 'You\'ve cleared your notes. :(');
//           }, 5000);
//         }
//       }
//     });

    function activate() {
      var promises = [init()];

      return $q.all(promises)
        .then(function() {
          vm.note.color = 'white';
//           if (vm.currentUser.is_new) {
//             $timeout(function() {
//               Notification.notify('info', 'Welcome to znote, get started by adding a Note.');
//               // Add default note.
//               Create({
//                 title: 'Welcome to Znote',
//                 trix: '<div><h3>Znote lets you quickly capture what’s on your mind.</h3> <br><h3>To start a new note, use the "Add note" bar above.</h3></div>',
//                 color: 'yellow'
//               });
//             }, 1000);
//           }

          cfpLoadingBar.complete();
        })
        .catch(function(err) {
          Notification.notify('error', 'Error while loading. Try again...(ツ)');
        })
    }

    function init() {
      return Note.all(vm.currentUser.$id)
        .then(function(notes) {
          vm.Notes = notes;
        })
        .catch(function(err) {
          vm.Notes = [];
          Notification.notify('error', 'An error occurred while loading notes. Try again...(ツ)');
        });
    }

//     vm.trixInitialize = function(e, editor) {
//       editor.setSelectedRange([0, 0]);
//       editor.insertHTML("<div>Znote <strong>rocks!</strong>, do you?</div>");
//     };

 //    var events = ['trixInitialize', 'trixChange', 'trixSelectionChange', 'trixFocus', 'trixBlur', 'trixFileAccept', 'trixAttachmentAdd', 'trixAttachmentRemove'];
//
//     for (var i = 0; i < events.length; i++) {
//         vm[events[i]] = function(e) {
// //           console.log(e.type)
//             document.getElementById(e.type).className = 'active';
//             $timeout(function() {
//                 document.getElementById(e.type).className = '';
//             }, 500);
// //             console.info('Event type:', e.type, vm.trix, vm.noteTitle);
//         }
//     };
//     var createStorageKey, host, uploadAttachment;
//
//     vm.trixAttachmentAdd = function(e) {
//         document.getElementById('trix-attachment-add').className = 'active';
//         $timeout(function() {
//             document.getElementById('trix-attachment-add').className = '';
//         }, 500);
//         console.log(e);
//         var attachment;
//         attachment = e.attachment;
//         if (attachment.file) {
//             return uploadAttachment(attachment);
//         }
//     }
//
//     host = "https://d13txem1unpe48.cloudfront.net/";
//
//     uploadAttachment = function(attachment) {
//         var file, form, key, xhr;
//         file = attachment.file;
//         key = createStorageKey(file);
//         form = new FormData;
//         form.append("key", key);
//         form.append("Content-Type", file.type);
//         form.append("file", file);
//         xhr = new XMLHttpRequest;
//         xhr.open("POST", host, true);
//         xhr.upload.onprogress = function(event) {
//             var progress;
//             progress = event.loaded / event.total * 100;
//             return attachment.setUploadProgress(progress);
//         };
//         xhr.onload = function() {
//             var href, url;
//             if (xhr.status === 204) {
//                 url = href = host + key;
//                 return attachment.setAttributes({
//                     url: url,
//                     href: href
//                 });
//             }
//         };
//         return xhr.send(form);
//     };
//
//     createStorageKey = function(file) {
//         var date, day, time;
//         date = new Date();
//         day = date.toISOString().slice(0, 10);
//         time = date.getTime();
//         return "tmp/" + day + "/" + time + "-" + file.name;
//     };

    function Create(note) {
      cfpLoadingBar.start();
      var uid = vm.currentUser.$id;

      if (uid) {
        var color = note.color || 'white';

        Note.create(uid, note.title, note.trix, color)
          .then(function(id) {
            Notification.notify('success', 'Note added!');
            cfpLoadingBar.complete();
  //           $state.go('note', { id: id, title: vm.noteTitle });
            vm.note = {
              title: '',
              trix: ''
            };
            vm.show = false;
          })
          .catch(function(err) {
            Notification.notify('error', 'Note not created!. Try again...(ツ)');
          });
      } else {
          Notification.notify('error', 'Note not created!. Try again...(ツ)');
      }
    }

    function Remove(noteId, metadataId) {
      cfpLoadingBar.start();
      var uid = vm.currentUser.$id;

      if (uid && noteId && metadataId) {
        Note.remove(uid, noteId, metadataId)
          .then(function(data) {
            Notification.notify('success', 'Note deleted!');
            cfpLoadingBar.complete();
          })
          .catch(function(err) {
            Notification.notify('error', 'Note not deleted!. Try again...(ツ)');
          });
      } else {
          Notification.notify('error', 'Note not deleted!. Try again...(ツ)');
      }
    }
  }
})()