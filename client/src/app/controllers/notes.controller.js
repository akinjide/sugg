(function() {
  "use strict";

  angular
    .module('znote.controllers')
    .controller('NotesController', NotesController)

  NotesController.$inject = ['$q', '$state', '$rootScope', '$timeout', 'cfpLoadingBar', '$scope', '$localStorage', 'LxDialogService', 'clipboard', 'Note', 'Notification', 'Settings'];

  function NotesController ($q, $state, $rootScope, $timeout, cfpLoadingBar, $scope, $localStorage, LxDialogService, clipboard, Note, Notification, Settings) {
    var vm = this;

    vm.isLoggedIn = $rootScope.isLoggedIn;
    vm.NoteColors = [
      'white', 'blue', 'red',
      'orange', 'yellow', 'grey',
      'teal', 'green'
    ];
    vm.dialogId = 'dialog' + Math.floor((Math.random() * 6) + 1);
    var defaultNote = {
      title: '',
      trix: '',
      settings: {
        color: ''
      }
    };

    vm.note = defaultNote;
    vm.Remove = Remove;
    vm.Create = Create;
    vm.ChangeNoteColor = ChangeNoteColor;
    vm.Copy = Copy;
    vm.Edit = Edit;

    if (vm.isLoggedIn) {
      vm.currentUser = $rootScope.currentUser;

      if (!clipboard.supported) {
        vm.CopyNotSupported = true;
      }

      ///////////////////////
      // WATCHERS
      //////////////////////
      $scope.$on('handleBroadcast', function(e, args) {
        console.log(e, Note, 'line 31', args);

        if (Note.syncedNotes) {
          vm.Notes = Note.syncedNotes;
        }
      });
    }

    /////////////////////

    cfpLoadingBar.start();
    activate();


    function activate() {
      var promises = [init(), Settings.find(vm.currentUser.$id)];

      return $q.all(promises)
        .then(function(response) {
          var userSettings = response[1];

          cfpLoadingBar.complete();
          vm.note.settings.color = userSettings.defaultNoteColor;
          vm.View = $localStorage.view || userSettings.defaultLayout;
        })
        .catch(function(err) {
          Notification.notify('error', 'Error while loading. Try again...(ツ)');
        })
    }

    /////////////////////


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


    function Create(note) {
      cfpLoadingBar.start();
      var uid = vm.currentUser.$id;

      if (uid) {
        Note.create(uid, note.title, note.trix, note.settings)
          .then(function(id) {
            cfpLoadingBar.complete();
            Note.sync(uid);
            Notification.notify('success', 'Note added!');
            vm.note = defaultNote;
            vm.show = false;
            Reload();
          })
          .catch(function(err) {
            Notification.notify('error', 'Note not created!. Try again...(ツ)');
          });
      } else {
          Notification.notify('error', 'Note not created!. Try again...(ツ)');
      }
    }


    function ChangeNoteColor(noteId, metadataId, color) {
      var uid = vm.currentUser.$id;
      var options = {};

      options.color = color;

      Note.edit(uid, noteId, metadataId, options)
        .then(function(data) {
          Note.sync(uid);
          Reload();
        })
        .catch(function(error) {
          Notification.notify('error', 'Note not updated!. Try again...(ツ)');
        });
    }


    function Remove(noteId, metadataId) {
      var uid = vm.currentUser.$id;

      if (uid && noteId && metadataId) {
        Note.remove(uid, noteId, metadataId)
          .then(function(data) {
            Notification.notify('success', 'Note deleted!');
            Note.sync(uid);
            Reload();
          })
          .catch(function(error) {
            Notification.notify('error', 'Note not deleted!. Try again...(ツ)');
          });
      } else {
          Notification.notify('error', 'Note not deleted!. Try again...(ツ)');
      }
    }


    function Reload() { $state.reload(); }


    function Copy(note) {
      if (!clipboard.supported) {
        vm.CopyNotSupported = true;
        Notification.notify('error', 'Note not copied! Copy to clipboard not supported');
      }

      try {
        clipboard.copyText(angular.element(note).text());
        Notification.notify('success', 'Note copied to clipboard!');
      } catch(error) {
        Notification.notify('error', 'Nothing to copy...(ツ)');
      }
    }

    function Edit(note) {
      vm.editNote = note;

      LxDialogService.open(vm.dialogId, note);
//       vm.note = {
//         title: note.metadata.title,
//         trix: note.content,
//         color: note.color
//       };
      console.log(note, 'line 173');
    }


   //  vm.trixInitialize = function(e, editor) {
//       editor.setSelectedRange([0, 0]);
//       editor.insertHTML("<div>Znote <strong>rocks!</strong>, do you?</div>");
//     };
//
//     var events = ['trixInitialize', 'trixChange', 'trixSelectionChange', 'trixFocus', 'trixBlur', 'trixFileAccept', 'trixAttachmentAdd', 'trixAttachmentRemove'];
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

  }
})()