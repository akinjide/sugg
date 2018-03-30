(function() {
  "use strict";

  angular
    .module('sugg.controllers')
    .controller('NotesController', NotesController)

  NotesController.$inject = ['$q', '$state', '$controller', '$transitions', '$rootScope', '$timeout', 'cfpLoadingBar', '$scope', '$localStorage', 'LxDialogService', 'clipboard', 'Note', 'Notification', 'Settings', 'Authentication', 'filterFilter'];

  function NotesController ($q, $state, $controller, $transitions, $rootScope, $timeout, cfpLoadingBar, $scope, $localStorage, LxDialogService, clipboard, Note, Notification, Settings, Authentication, filterFilter) {
    var vm = this;

    vm._main = $controller('MainController', {});
    vm.isLoggedIn = vm._main.isLoggedIn;
    vm.NoteColors = [
      'white', 'blue', 'red', 'orange', 'yellow',
      'pink', 'brown', 'grey', 'teal', 'green'
    ];
    vm.dialogId = 'dialog' + Math.floor((Math.random() * 6) + 1);
    vm.removeQueue = [];
    var defaultNote = {
      title: '',
      content: '',
      settings: {
        color: ''
      }
    };

    vm.note = defaultNote;
    vm.Remove = Remove;
    vm.RemoveMarked = RemoveMarked;
    vm.Create = Create;
    vm.ChangeNoteColor = ChangeNoteColor;
    vm.ColorMarkedNote = ColorMarkedNote;
    vm.Copy = Copy;
    vm.Edit = Edit;
    vm.MarkNote = MarkNote;
    vm.ClearMarked = ClearMarked;
    vm.AttachmentAdd = vm.AttachmentAdd;

    if (vm.isLoggedIn) {
      vm.currentUser = vm._main.currentUser;

      if (!clipboard.supported) {
        vm.CopyNotSupported = true;
      }

      ///////////////////////
      // WATCHERS
      //////////////////////
      $scope.$on('handleBroadcast', function(e, args) {
        if (Note.syncedNotes) {
          vm.Notes = Note.syncedNotes;
        }
      });

      $scope.$on('filterSearch', function(e, args) {
        vm.Search = '';

        if (args.text) {
          vm.Search = args.text;
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
        Note.create(uid, note.title, note.content, note.settings)
          .then(function(id) {
            cfpLoadingBar.complete();
            Note.sync(uid);
            Notification.notify('success', 'Note added');
            vm.note = defaultNote;
            vm.show = false;
            Reload();
          })
          .catch(function(err) {
            Notification.notify('error', 'Note not created. Try again...(ツ)');
          });
      } else {
          Notification.notify('error', 'Note not created. Try again...(ツ)');
      }
    }


    function ChangeNoteColor(noteId, metadataId, color) {
      var uid = vm.currentUser.$id;

      Note.edit(uid, noteId, metadataId, {
        color: color
      })
      .then(function(data) {
        Note.sync(uid);
        Reload();
      })
      .catch(function(error) {
        Notification.notify('error', 'Note not updated. Try again...(ツ)');
      });
    }


    function ColorMarkedNote(color) {
      var uid = vm.currentUser.$id;
      var promises = [];

      for (var i = 0; i < vm.removeQueue.length; i++) {
        promises.push(
          Note.edit(
            uid,
            vm.removeQueue[i].note.metadata.note_id,
            vm.removeQueue[i].note.metadata.$id,
            { color: color }
          )
        )
      }

      $q.all(promises)
        .then(function(data) {
          vm.removeQueue = [];
          Note.sync(uid);
          Reload();
        })
        .catch(function(error) {
          Notification.notify('error', 'Notes not updated. Try again...(ツ)');
        });
    }


    function Remove(noteId, metadataId) {
      var uid = vm.currentUser.$id;

      if (uid && noteId && metadataId) {
        Note.remove(uid, noteId, metadataId)
          .then(function(data) {
            Notification.notify('success', 'Note deleted');
            Note.sync(uid);
            Reload();
          })
          .catch(function(error) {
            Notification.notify('error', 'Note not deleted. Try again...(ツ)');
          });
      } else {
          Notification.notify('error', 'Note not deleted. Try again...(ツ)');
      }
    }


    function RemoveMarked() {
      var uid = vm.currentUser.$id;
      var promises = [];

      for (var i = 0; i < vm.removeQueue.length; i++) {
        promises.push(
          Note.remove(
            uid,
            vm.removeQueue[i].note.metadata.note_id,
            vm.removeQueue[i].note.metadata.$id
          )
        )
      }

      $q.all(promises)
        .then(function(data) {
          vm.removeQueue = [];
          Notification.notify('success', 'Notes deleted');
          Note.sync(uid);
          Reload();
        })
        .catch(function(error) {
          Notification.notify('error', 'Notes not deleted. Try again...(ツ)');
        });
    }


    function Reload() { $state.reload(); }


    function ClearMarked() {
      for (var i = 0; i < vm.removeQueue.length; i++) {
        vm.removeQueue[i].note.Selected = false;
      }

      vm.removeQueue = [];
    }


    function MarkNote(note, state) {
      if (state) {
        vm.removeQueue.push({
          id: note.metadata.note_id,
          note: note
        });
      } else {
        vm.removeQueue = vm.removeQueue.filter(function(singleQueue) {
          return singleQueue.id !== note.metadata.note_id
        });
      }
    }


    function Copy(note) {
      if (!clipboard.supported) {
        vm.CopyNotSupported = true;
        Notification.notify('error', 'Note not copied Copy to clipboard not supported');
      }

      try {
        clipboard.copyText(angular.element(note).text());
        Notification.notify('success', 'Note copied to clipboard');
      } catch(error) {
        Notification.notify('error', 'Nothing to copy...(ツ)');
      }
    }


    function Edit(previousNote, state, nowNote) {
      var uid = vm.currentUser.$id;

      if (!state) {
        vm.editNote = previousNote;
        LxDialogService.open(vm.dialogId, previousNote);

        (function() {
          vm.initializeEdit = function(e, editor) {
            editor.setSelectedRange([0, previousNote.content.length]);
            editor.insertHTML(previousNote.content || '');
          };
        })();

        return;
      }

      if (state) {
        if (nowNote && nowNote.title) {
          Note.rename(uid, previousNote.metadata.$id, nowNote.title)
            .then(function(data) {
              Notification.notify('success', 'Note Renamed');
              Note.sync(uid);
              Reload();
            })
            .catch(function(error) {
              Notification.notify('error', 'Note not renamed. Try again...(ツ)');
            });

          return;
        }

        if (nowNote && nowNote.content) {
          Note.edit(uid, previousNote.metadata.note_id, previousNote.metadata.$id, {
            content: nowNote.content
          })
          .then(function(data) {
              Notification.notify('success', 'Note Updated');
              Note.sync(uid);
              Reload();
            })
            .catch(function(error) {
              Notification.notify('error', 'Note not updated. Try again...(ツ)');
            });

          return;
        }

        if (nowNote && (nowNote.title && nowNote.content)) {
          Note.rename(uid, previousNote.metadata.$id, nowNote.title)
            .then(function(data) {

              Note.edit(uid, previousNote.metadata.note_id, previousNote.metadata.$id, {
                content: nowNote.content
              })
              .then(function(data) {
                  Notification.notify('success', 'Note Updated');
                  Note.sync(uid);
                  Reload();
                })
                .catch(function(error) {
                  Notification.notify('error', 'Note not updated. Try again...(ツ)');
                });

            })
            .catch(function(error) {
              Notification.notify('error', 'Note not updated. Try again...(ツ)');
            });

          return;
        }
      }
    }

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

    var host = "https://d13txem1unpe48.cloudfront.net/";

    function AttachmentAdd(e) {
        document.getElementById('trix-attachment-add').className = 'active';
        $timeout(function() {
            document.getElementById('trix-attachment-add').className = '';
        }, 500);
//         console.log(e);
        var attachment;
        attachment = e.attachment;
        if (attachment.file) {
            return uploadAttachment(attachment);
        }
    }

    function createStorageKey(file) {
      var date, day, time;
      date = new Date();
      day = date.toISOString().slice(0, 10);
      time = date.getTime();
      return "tmp/" + day + "/" + time + "-" + file.name;
    }

    function uploadAttachment(attachment) {
      var file, form, key, xhr;
      file = attachment.file;
      key = createStorageKey(file);
      form = new FormData;
      form.append("key", key);
      form.append("Content-Type", file.type);
      form.append("file", file);
      xhr = new XMLHttpRequest;
      xhr.open("POST", host, true);

      xhr.upload.onprogress = function(event) {
          var progress;
          progress = event.loaded / event.total * 100;
          return attachment.setUploadProgress(progress);
      }

      xhr.onload = function() {
          var href, url;
          if (xhr.status === 204) {
              url = href = host + key;
              return attachment.setAttributes({
                  url: url,
                  href: href
              });
          }
      }

      return xhr.send(form);
    }
  }
})()