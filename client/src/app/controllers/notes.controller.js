(function() {
  "use strict";

  function NotesController ($location, $q, $state, $controller, $timeout, cfpLoadingBar, $scope, $localStorage, LxDialogService, clipboard, Note, Notification, Settings, Response, Tag, User, sharedWithMe) {
    var vm = this;
    var cachedUsers = [];

    vm._main = $controller('MainController', {});
    vm.isLoggedIn = vm._main.isLoggedIn;
    vm.NoteColors = [
      'white', 'blue', 'red', 'orange', 'yellow', 'blueberry',
      'pink', 'brown', 'grey', 'teal', 'green', 'lavender'
    ];
    vm.dialogEditId = 'dialog-edit' + Math.floor((Math.random() * 6) + 1);
    vm.dialogShareId = 'dialog-share' + Math.floor((Math.random() * 6) + 1);
    vm.dialogTagId = 'dialog-tag' + Math.floor((Math.random() * 6) + 1);
    vm.removeQueue = [];
    vm.tagChoices = [];
    vm.currentNote = null;
    vm.ShareWith = [];
    vm.Owner = null;
    vm.ShowTags = false;
    vm.shareLoading = true;

    var defaultNote = {
      title: '',
      content: '',
      settings: {
        color: ''
      },
      tags: []
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
    vm.findShareWithUser = findShareWithUser;
    vm.ShareWithUser = ShareWithUser;
    vm.RemoveShareWithUser = RemoveShareWithUser;
    vm.GetShareLink = GetShareLink;
    vm.MakeCopy = MakeCopy;
    vm.transformNewTag = transformNewTag;
    vm.ShowTags = ShowTags;
    vm.RemoveTag = RemoveTag;

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
        Tag.all()
      ];

      return $q.all(promises)
        .then(function(response) {
          var userSettings = response[1];
          var tags = response[2];

          cfpLoadingBar.complete();
          vm.note.settings.color = userSettings.default_note_color;
          vm.View = userSettings.default_layout || $localStorage.view || 'list';
          vm.Tags = tags.map(function(tag) {
            return {
              'tag_id': tag.$id,
              'title': tag.title
            }
          });
        })
        .catch(function() {
          Notification.notify('error', Response.error['page']);
        });
    }

    /////////////////////


    function init() {
      return Note.all(vm.currentUser.$id)
        .then(function(notes) {
          vm.Notes = _.concat(notes, sharedWithMe);
        })
        .catch(function(error) {
          vm.Notes = _.concat([], sharedWithMe);
          Notification.notify('error', Response.error['note.loading']);
        });
    }


    function Create(note) {
      cfpLoadingBar.start();
      var uid = vm.currentUser.$id;

      if (uid) {
        Note.create(uid, note.title, note.content, note.settings, note.tags)
          .then(function(id) {
            return Settings.update(vm.currentUser.$id, {
              default_note_color: note.settings.color
            });
          })
          .then(function() {
            cfpLoadingBar.complete();
            Note.sync(uid);
            vm.note = defaultNote;
            vm.show = false;
            Reload();
          })
          .catch(function(error) {
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


    function Remove(note, noteId, metadataId) {
      var uid = vm.currentUser.$id;
      var promises = [];
      var shareWithIds = _.keys(note.metadata.share_with);

      if (uid && noteId && metadataId) {
        if (note.metadata && note.metadata.share_with) {
          for (var i = 0; i < shareWithIds.length; i++) {
            promises.push(
              RemoveShareWithUser(
                { uid: shareWithIds[i] },
                note
              )
            )
          }

          $q.all(promises)
            .then(function(data) {
              Note.remove(uid, noteId, metadataId)
                .then(function(data) {
                  Note.sync(uid);
                  Reload();
                })
                .catch(function(error) {
                  Notification.notify('error', Response.error['note.delete']);
                });
            })
            .catch(function(error) {
              Notification.notify('error', Response.error['note.delete']);
            });
        } else {
          Note.remove(uid, noteId, metadataId)
            .then(function(data) {
              Note.sync(uid);
              Reload();
            })
            .catch(function(error) {
              Notification.notify('error', Response.error['note.delete']);
            });
        }
      } else {
          Notification.notify('error', Response.error['note.delete']);
      }
    }

    // TODO: remove shared when marked use Remove method maybe?
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
        cachedUsers = filterFunc(responses[2]).filter(function(user) {
          return user.uid != uid;
        });
        vm.shareLoading = false;
      })
      .catch(function() {
        Notification.notify('error', Response.error['note.loading']);
      });

      LxDialogService.open(vm.dialogShareId);
    }


    function findShareWithUser(userEmail) {
      vm.addUser = cachedUsers.filter(function(user) {
        if (user.email == userEmail.trim()) {
          Notification.notify('simple', user.name + ' will be added');
          return user;
        }
      });
    }


    function ShareWithUser(user, note) {
      if (!user) {
        return;
      }

      if (user && !user.length) {
        Notification.notify('simple', 'No user to share with');
        return;
      }

      var uid = vm.currentUser.$id;
      vm.selectedShareUser = '';

      CopyShareLink(note.metadata.note_id, note.metadata.$id, true);
      Note.share(uid, note.metadata.note_id, note.metadata.$id, user[0].uid)
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
      var shareWithMe = _.pick(note.metadata.share_with, [user.uid]);
      var sharedWithMeId = shareWithMe[user.uid].share_id;

      Note.removeShare(uid, note.metadata.note_id, note.metadata.$id, user.uid, sharedWithMeId)
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
      var tags = [];

      if (note.metadata.tags && note.metadata.tags.length) {
        tags = note.metadata.tags.map(function(id) { return { tag_id: id } })
      }

      Create({
        'title': note.metadata.title,
        'content': note.content,
        'settings': {
          'color': note.settings.color
        },
        'tags': tags
      });
    }


    function ShowTags(note, tags) {
      vm.currentNote = note;
      vm.shareLoading = true;
      LxDialogService.open(vm.dialogTagId);

      if (tags && tags.length) {
        var promises = [];

        for (var i = 0; i < tags.length; i++) {
          promises.push(
            Tag.find(
              tags[i]
            )
          )
        }

        $q.all(promises)
          .then(function(data) {
            vm.NoteTags = data.map(function(tag) {
              return {
                'tag_id': tag.$id,
                'title': tag.title
              }
            });

            vm.shareLoading = false;
          })
          .catch(function(error) {
            Notification.notify('error', 'Error fetching tags');
          });
      } else {
        vm.shareLoading = false;
      }
    }


    function RemoveTag(note, tag) {
      console.log(note, tag);
    }


    function transformNewTag(_newValue) {
//      vm.shareLoading = true;
//
//      return Tag.add(_newValue)
//        .then(function(data) {
//          vm.shareLoading = false;
//
//          return {
//            title: _newValue,
//            tag_id: data.tagId
//          };
//        })
//        .catch(function(error) {
//          Notification.notify('error', 'Error adding tag');
//        });
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

  NotesController.$inject = ['$location', '$q', '$state', '$controller', '$timeout', 'cfpLoadingBar', '$scope', '$localStorage', 'LxDialogService', 'clipboard', 'Note', 'Notification', 'Settings', 'Response', 'Tag', 'User', 'sharedWithMe'];
})();
