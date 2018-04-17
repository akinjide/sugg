(function() {
  "use strict";

  function NotesController ($location, $q, $state, $controller, $timeout, cfpLoadingBar, $scope, $localStorage, LxDialogService, clipboard, Note, Notification, Settings, Response, Label, User, sharedWithMe) {
    var vm = this;

    vm._main = $controller('MainController', {});
    vm.isLoggedIn = vm._main.isLoggedIn;
    vm.NoteColors = [
      'white', 'blue', 'red', 'orange', 'yellow',
      'pink', 'brown', 'grey', 'teal', 'green'
    ];
    vm.dialogEditId = 'dialog-edit' + Math.floor((Math.random() * 6) + 1);
    vm.dialogShareId = 'dialog-share' + Math.floor((Math.random() * 6) + 1);
    vm.removeQueue = [];
    vm.labelChoices = [];
    vm.currentNote = null;
    vm.ShareWith = [];
    vm.Owner = null;
    vm.Users = [];
    vm.ShowLabels = false;
    vm.shareLoading = true;

    var defaultNote = {
      title: '',
      content: '',
      settings: {
        color: ''
      },
      labels: []
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
    vm.AttachmentAdd = AttachmentAdd;
    vm.CopyShareLink = CopyShareLink;
    vm.ShareNote = ShareNote;
    vm.ShareWithUser = ShareWithUser;
    vm.RemoveShareWithUser = RemoveShareWithUser;
    vm.GetShareLink = GetShareLink;
    vm.MakeCopy = MakeCopy;
    vm.transformNewLabel = transformNewLabel;
    vm.LookupLabel = LookupLabel;

    if (vm.isLoggedIn) {
      vm.currentUser = vm._main.currentUser;

      if (!clipboard.supported) {
        vm.CopyNotSupported = true;
      }

      ///////////////////////
      // WATCHERS
      //////////////////////
      $scope.$on('handleBroadcast', function(e) {
        if (Note.syncedNotes) {
          vm.Notes = _.concat(Note.syncedNotes, sharedWithMe);
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
      var promises = [
        init(),
        Settings.find(vm.currentUser.$id),
        Label.all()
      ];

      return $q.all(promises)
        .then(function(response) {
          var userSettings = response[1];
          var labels = response[2];

          cfpLoadingBar.complete();
          vm.note.settings.color = userSettings.defaultNoteColor;
          vm.View = $localStorage.view || userSettings.defaultLayout;
          vm.Labels = labels.map(function(label) {
            return {
              'label_id': label.$id,
              'title': label.title
            }
          });
        })
        .catch(function() {
          Notification.notify('error', Response.error['page']);
        })
    }

    /////////////////////


    function init() {
      return Note.all(vm.currentUser.$id)
        .then(function(notes) {
          vm.Notes = _.concat(notes, sharedWithMe);
        })
        .catch(function(err) {
          vm.Notes = _.concat([], sharedWithMe);
          Notification.notify('error', Response.error['note.loading']);
        });
    }


    function Create(note) {
      cfpLoadingBar.start();
      var uid = vm.currentUser.$id;

      if (uid) {
        Note.create(uid, note.title, note.content, note.settings, note.labels)
          .then(function(id) {
            cfpLoadingBar.complete();
            Note.sync(uid);
            Notification.notify('simple', Response.success['note.create']);
            vm.note = defaultNote;
            vm.show = false;
            Reload();
          })
          .catch(function(err) {
            Notification.notify('error', Response.error['note.create']);
          });
      } else {
          Notification.notify('error', Response.error['note.create']);
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
        Notification.notify('error', Response.error['note.update']);
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
          Notification.notify('error', Response.error['note.bulk.update']);
        });
    }


    function Remove(noteId, metadataId) {
      var uid = vm.currentUser.$id;

      if (uid && noteId && metadataId) {
        Note.remove(uid, noteId, metadataId)
          .then(function(data) {
            Notification.notify('simple', Response.success['note.delete']);
            Note.sync(uid);
            Reload();
          })
          .catch(function(error) {
            Notification.notify('error', Response.error['note.delete']);
          });
      } else {
          Notification.notify('error', Response.error['note.delete']);
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
          Notification.notify('simple', Response.success['note.bulk.delete']);
          Note.sync(uid);
          Reload();
        })
        .catch(function(error) {
          Notification.notify('error', Response.error['note.bulk.delete']);
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
          return singleQueue.id !== note.metadata.note_id;
        });
      }
    }


    function Copy(note) {
      if (!clipboard.supported) {
        vm.CopyNotSupported = true;
        Notification.notify('error', Response.warn['copy.not_supported']);
      }

      try {
        clipboard.copyText(angular.element(note).text());
        Notification.notify('simple', Response.success['copy']);
      } catch(error) {
        Notification.notify('error', Response.error['copy']);
      }
    }


    function Edit(previousNote, state, nowNote) {
      var uid = vm.currentUser.$id;

      if (!state) {
        vm.editNote = previousNote;
        LxDialogService.open(vm.dialogEditId);

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
              Notification.notify('simple', Response.success['note.rename']);
              Note.sync(uid);
              Reload();
            })
            .catch(function(error) {
              Notification.notify('error', Response.error['note.rename']);
            });

          return;
        }

        if (nowNote && nowNote.content) {
          Note.edit(uid, previousNote.metadata.note_id, previousNote.metadata.$id, {
            content: nowNote.content
          })
          .then(function(data) {
              Notification.notify('simple', Response.success['note.update']);
              Note.sync(uid);
              Reload();
            })
            .catch(function(error) {
              Notification.notify('error', Response.error['note.update']);
            });

          return;
        }

        if (nowNote && (nowNote.title && nowNote.content)) {
          $q.all([
            Note.rename(uid, previousNote.metadata.$id, nowNote.title),
            Note.edit(uid, previousNote.metadata.note_id, previousNote.metadata.$id, {
              content: nowNote.content
            })
          ])
          .then(function(data) {
            Notification.notify('simple', Response.success['note.update']);
            Note.sync(uid);
            Reload();
          })
          .catch(function(error) {
            Notification.notify('error', Response.error['note.update']);
          });

          return;
        }
      }
    }


    function CopyShareLink(noteId, metaId, isSharedWithUser) {
      var uid = vm.currentUser.$id;
      var shareLink = $location.host() + '/note/d/' + noteId + '?uid=' + uid + '&meta_id=' + metaId + '&shared=' + isSharedWithUser;

      if (!clipboard.supported) {
        vm.CopyNotSupported = true;
        Notification.notify('error', Response.warn['copy.not_supported']);
      }

      try {
        clipboard.copyText(shareLink);
        Notification.notify('simple', Response.success['copy']);
      } catch(error) {
        Notification.notify('error', Response.error['copy']);
      }
    }


    function ShareNote(note) {
      vm.currentNote = note;
      var uid = vm.currentUser.$id;
      var promises = [
        User.find(uid),
        Note.allShare(uid, note.metadata.$id),
        User.all()
      ];

      function filterFunc(users) {
        return users.map(function(user) {
          return {
            email: user.email,
            name: user.name,
            image_url: user.image_url,
            uid: user.$id
          }
        });
      }

      $q.all(promises).then(function(responses) {
        vm.Owner = responses[0];
        vm.ShareWith = filterFunc(responses[1]);
        vm.Users = filterFunc(responses[2]).filter(function(user) {
          return user.uid != uid;
        });
        vm.shareLoading = false;
      })
      .catch(function() {
        Notification.notify('error', Response.error['note.loading']);
      });

      LxDialogService.open(vm.dialogShareId);
    }


    function ShareWithUser(user, note) {
      if (!user) {
        return;
      }

      var uid = vm.currentUser.$id;

      CopyShareLink(note.metadata.note_id, note.metadata.$id, true);
      Note.share(uid, note.metadata.note_id, note.metadata.$id, user.uid)
        .then(function(data) {
          Notification.notify('simple', Response.success['share.generated']);
          Note.sync(uid);
          Reload();
        })
        .catch(function(error) {
          Notification.notify('error', Response.error['note.update']);
        });
    }


    function RemoveShareWithUser(user, note) {
      var uid = vm.currentUser.$id;
      var shareWithMe = _.pick(note.metadata.share_with, [user.uid])

      Note.removeShare(uid, note.metadata.note_id, note.metadata.$id, user.uid, shareWithMe[user.uid].share_id)
        .then(function(data) {
          Note.sync(uid);
          Reload();
        })
        .catch(function(error) {
          Notification.notify('error', Response.error['note.update']);
        });
    }


    function GetShareLink(note, noteIsPublic) {
      var uid = vm.currentUser.$id;

      if (!noteIsPublic) {
        CopyShareLink(note.metadata.note_id, note.metadata.$id, false);
      }

      Note.edit(uid, note.metadata.note_id, note.metadata.$id, {
        isPublic: !noteIsPublic,
        type: 'share'
      })
      .then(function(data) {
        if (!noteIsPublic) {
          Notification.notify('simple', Response.success['share.generated']);
        } else {
          Notification.notify('simple', Response.success['share.disabled']);
        }

        Note.sync(uid);
        Reload();
      })
      .catch(function(error) {
        Notification.notify('error', Response.error['note.update']);
      });
    }


    function MakeCopy(note) {
      Create({
        'title': note.metadata.title,
        'content': note.content,
        'settings': {
          'color': note.settings.color
        },
        'labels': note.metadata.labels
      });
    }


    function LookupLabel(labels) {
//       console.log(labels, 'line 396s')
//       for (var i = 0; i < labels.length; i++) {
//         if (typeof labels[i].label_id == "object") {
//           labels[i].label_id.then(function(data) {
//             labels[i].label_id = data.labelId;
//           });
//         }
//Software Craftsman

//       }
    }


    function transformNewLabel(_newValue) {
      return {
        title: _newValue,
        label_id: Label.add(_newValue)
      };
    }

//     var events = ['trixInitialize', 'trixChange', 'trixSelectionChange', 'trixFocus', 'trixBlur', 'trixFileAccept', 'trixAttachmentAdd', 'trixAttachmentRemove'];
//
//     for (var i = 0; i < events.length; i++) {
//       vm[events[i]] = function(e) {
//         console.log(e.type)
//         document.getElementById(e.type).className = 'active';
//         $timeout(function() {
//             document.getElementById(e.type).className = '';
//         }, 500);
//
//         console.info('Event type:', e.type, vm.trix, vm.noteTitle);
//       }
//     };

    function AttachmentAdd(event) {
        var attachment = event.attachment;

        document.getElementById('trix-attachment-add').className = 'active';
        $timeout(function() {
          document.getElementById('trix-attachment-add').className = '';
        }, 500);

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
      var host = "https://d13txem1unpe48.cloudfront.net/";
      var file = attachment.file;
      var key = createStorageKey(file);
      var form = new FormData;
      var xhr = new XMLHttpRequest;

      form.append("key", key);
      form.append("Content-Type", file.type);
      form.append("file", file);
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

  angular
    .module('sugg.controllers')
    .controller('NotesController', NotesController);

  NotesController.$inject = ['$location', '$q', '$state', '$controller', '$timeout', 'cfpLoadingBar', '$scope', '$localStorage', 'LxDialogService', 'clipboard', 'Note', 'Notification', 'Settings', 'Response', 'Label', 'User', 'sharedWithMe'];
})();