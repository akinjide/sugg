(function () {
  'use strict'

  function NotesController ($location, $q, $state, $controller, $timeout, cfpLoadingBar, Upload, $scope, $localStorage, LxDialogService, clipboard, Note, Notification, Settings, Response, Tag, User, Storage, sharedWithMe, SUGG_FEATURE_FLAG, SUGG_COMMON, currentAuth, pinned) {
    var vm = this
    var cachedUsers = []
    var MAX_WIDTH_MOBILE = 480

    vm._main = $controller('MainController', {})
    vm.isLoggedIn = vm._main.isLoggedIn

    if (vm.isLoggedIn) {
      vm.currentUser = vm._main.currentUser
    }

    vm.NoteColors = SUGG_COMMON.COLORS
    vm.dialogEditId = 'dialog-edit-' + (Math.random() * 100)
    vm.dialogShareId = 'dialog-share-' + (Math.random() * 100)
    vm.dialogTagId = 'dialog-tag-' + (Math.random() * 100)
    vm.removeQueue = []
    vm.tagChoices = []
    vm.currentNote = null
    vm.ShareWith = []
    vm.Owner = null
    vm.ShowTags = false
    vm.shareLoading = true
    vm.flags = SUGG_FEATURE_FLAG
    vm.editorWidthClass = 'collapse-editor'
    vm.isMobile = (window.innerWidth <= MAX_WIDTH_MOBILE)

    var defaultNote = {
      title: '',
      content: '',
      settings: {
        color: ''
      },
      tags: []
    }

    vm.note = defaultNote
    vm.Remove = Remove
    vm.RemoveMarked = RemoveMarked
    vm.Create = Create
    vm.ChangeNoteColor = ChangeNoteColor
    vm.ChangeNotePin = ChangeNotePin
    vm.ColorMarkedNote = ColorMarkedNote
    vm.Copy = Copy
    vm.Edit = Edit
    vm.MarkNote = MarkNote
    vm.ClearMarked = ClearMarked
    vm.CopyShareLink = CopyShareLink
    vm.ShareNote = ShareNote
    vm.findShareWithUser = findShareWithUser
    vm.ShareWithUser = ShareWithUser
    vm.RemoveShareWithUser = RemoveShareWithUser
    vm.GetShareLink = GetShareLink
    vm.MakeCopy = MakeCopy
    vm.transformNewTag = transformNewTag
    vm.ShowTags = ShowTags
    vm.RemoveTag = RemoveTag
    vm.ChangeEditorWidth = ChangeEditorWidth
    vm.FileAccept = FileAccept
    vm.UploadDrop = UploadDrop
    vm.UploadPick = UploadPick
    vm.RemoveUpload = RemoveUpload

    if (vm.isLoggedIn) {
      vm.currentUser = vm._main.currentUser

      if (!clipboard.supported) {
        vm.CopyNotSupported = true
      }

      /// ////////////////////
      // WATCHERS
      /// ///////////////////
      $scope.$on('handleBroadcast', function (event) {
        if (Note.syncedNotes) {
          vm.Notes = _.concat(Note.syncedNotes, sharedWithMe)
        }
      })

      $scope.$on('filterSearch', function (events, params) {
        vm.Search = ''

        if (params.text) {
          vm.Search = params.text
        }
      })

      $scope.$on('lx-dialog__close-end', function (event, id, canceled, params) {
        vm.dialogEditId = 'dialog-edit-' + (Math.random() * 100)
        vm.dialogShareId = 'dialog-share-' + (Math.random() * 100)
        vm.dialogTagId = 'dialog-tag-' + (Math.random() * 100)
      })
    }

    /// //////////////////

    cfpLoadingBar.start()

    activate()

    function ChangeEditorWidth () {
      switch (vm.editorWidthClass) {
        case 'collapse-editor':
          vm.editorWidthClass = 'expand-editor'
          break

        case 'expand-editor':
          vm.editorWidthClass = 'collapse-editor'
          break
      }
    }

    function activate () {
      var promises = [
        init(),
        Settings.find(vm.currentUser.$id),
        Tag.all()
      ]

      return $q.all(promises)
        .then(function (response) {
          var userSettings = response[1]
          var tags = response[2]

          cfpLoadingBar.complete()
          vm.note.settings.color = userSettings.default_note_color
          vm.View = userSettings.default_layout || $localStorage.view || 'list'
          vm.PinnedNotes = pinned
          vm.Tags = tags.map(function (tag) {
            return {
              'tag_id': tag.$id,
              'title': tag.title
            }
          })
        })
        .catch(function () {
          Notification.notify('error', Response.core['core/page-loading-failed'])
        })
    }

    /// //////////////////

    function init () {
      return Note.all(vm.currentUser.$id)
        .then(function (notes) {
          vm.Notes = _.concat(notes, sharedWithMe)
        })
        .catch(function () {
          vm.Notes = _.concat([], sharedWithMe)
          Notification.notify('error', Response.notes['notes/loading-failed'])
        })
    }

    function Create (note) {
      cfpLoadingBar.start()
      var uid = vm.currentUser.$id

      if (uid) {
        Note
          .create(uid, note.title, note.content, note.settings, note.tags)
          .then(function () {
            return Settings.update(vm.currentUser.$id, {
              default_note_color: note.settings.color
            })
          })
          .then(function () {
            cfpLoadingBar.complete()
            vm.note = defaultNote
            vm.show = false
            Sync(uid)
          })
          .catch(function () {
            Notification.notify('error', Response.notes['notes/create-failed'])
          })
      } else {
        Notification.notify('error', Response.notes['notes/create-failed'])
      }
    }

    function ChangeNoteColor (noteId, metadataId, color) {
      var uid = vm.currentUser.$id

      Note
        .edit(uid, noteId, metadataId, {
          color: color
        })
        .then(function () {
          Sync(uid)
        })
        .catch(function () {
          Notification.notify('error', Response.notes['notes/update-failed'])
        })
    }

    function ChangeNotePin (noteId, metadataId, pinned) {
      var uid = vm.currentUser.$id

      Note
        .edit(uid, noteId, metadataId, {
          pin: !pinned,
          type: 'pin'
        })
        .then(function () {
          Sync(uid)
        })
        .catch(function () {
          Notification.notify('error', Response.notes['notes/update-failed'])
        })
    }

    function ColorMarkedNote (color) {
      var uid = vm.currentUser.$id
      var promises = []

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

      $q
        .all(promises)
        .then(function () {
          vm.removeQueue = []
          Sync(uid)
        })
        .catch(function () {
          Notification.notify('error', Response.notes['notes/bulk-update-failed'])
        })
    }

    function Remove (note, noteId, metadataId) {
      var uid = vm.currentUser.$id
      var promises = []

      if (uid && noteId && metadataId) {
        if (note.metadata && note.metadata.share_with) {
          var shareWithIds = Object.keys(note.metadata.share_with)

          for (var i = 0; i < shareWithIds.length; i++) {
            var sharedWithMeId = note.metadata.share_with[shareWithIds[i]].share_id

            promises.push(
              Note
                .removeShare(
                  uid,
                  note.metadata.note_id,
                  note.metadata.$id,
                  shareWithIds[i],
                  sharedWithMeId
                )
            )
          }

          $q
            .all(promises)
            .then(function () {
              return Note.remove(uid, noteId, metadataId)
            })
            .then(function () {
              Sync(uid)
            })
            .catch(function () {
              Notification.notify('error', Response.notes['notes/delete-failed'])
            })
        } else {
          Note
            .remove(uid, noteId, metadataId)
            .then(function () {
              Sync(uid)
            })
            .catch(function () {
              Notification.notify('error', Response.notes['notes/delete-failed'])
            })
        }
      } else {
        Notification.notify('error', Response.notes['notes/delete-failed'])
      }
    }

    function RemoveMarked () {
      var uid = vm.currentUser.$id

      function QueuedRemove (callback) {
        var outerPromises = []
        var innerPromises

        for (var i = 0; i < vm.removeQueue.length; i++) {
          innerPromises = []

          if (vm.removeQueue[i].note.metadata && vm.removeQueue[i].note.metadata.share_with) {
            var shareWithIds = Object.keys(vm.removeQueue[i].note.metadata.share_with)

            for (var j = 0; j < shareWithIds.length; j++) {
              var shareWithMe = _.pick(vm.removeQueue[i].note.metadata.share_with, [shareWithIds[j]])
              var sharedWithMeId = shareWithMe[shareWithIds[j]].share_id

              innerPromises.push(
                Note.removeShare(
                  uid,
                  vm.removeQueue[i].note.metadata.note_id,
                  vm.removeQueue[i].note.metadata.$id,
                  shareWithIds[j],
                  sharedWithMeId
                )
              )
            }
          }

          outerPromises.push(
            Note.remove(
              uid,
              vm.removeQueue[i].note.metadata.note_id,
              vm.removeQueue[i].note.metadata.$id
            )
          )

          var promises = $q.all(innerPromises)

          if (vm.removeQueue.length === (i + 1)) {
            promises
              .then(function () {
                callback(null, outerPromises)
              })
              .catch(function () {
                Notification.notify('error', Response.notes['notes/delete-failed'])
              })
          }
        }
      }

      QueuedRemove(function (_, promises) {
        $q
          .all(promises)
          .then(function () {
            vm.removeQueue = []
            // Notification.notify('simple', Response.success['note.bulk.delete'])
            Sync(uid)
          })
          .catch(function () {
            Notification.notify('error', Response.notes['notes/bulk-delete-failed'])
          })
      })
    }

    function Sync (uid) {
      Note.sync(uid)
      $state.reload()
    }

    function ClearMarked () {
      for (var i = 0; i < vm.removeQueue.length; i++) {
        vm.removeQueue[i].note.Selected = false
      }

      vm.removeQueue = []
    }

    function MarkNote (note, state) {
      if (state) {
        vm.removeQueue.push({
          id: note.metadata.note_id,
          note: note
        })
      } else {
        vm.removeQueue = vm.removeQueue.filter(function (singleQueue) {
          return singleQueue.id !== note.metadata.note_id
        })
      }
    }

    function Copy (note) {
      if (!clipboard.supported) {
        vm.CopyNotSupported = true
        Notification.notify('error', Response.notes['notes/copy-not-supported'])
      }

      try {
        clipboard.copyText(angular.element(note).text())
        Notification.notify('simple', Response.notes['notes/copy-success'])
      } catch (error) {
        Notification.notify('error', Response.notes['notes/copy-failed'])
      }
    }

    function Edit (previousNote, state, currentNote) {
      var uid = vm.currentUser.$id

      if (!state) {
        vm.editNote = previousNote
        LxDialogService.open(vm.dialogEditId)

        return (function () {
          vm.initializeEdit = function (e, editor) {
            editor.setSelectedRange([0, 9999999])
            editor.insertHTML(previousNote.content || '')
          }
        })()
      }

      if (state) {
        if (currentNote.content.length === previousNote.content.length && !currentNote.title) {
          return Sync(uid)
        }

        if (currentNote) {
          if (currentNote.title && currentNote.content) {
            return $q
              .all([
                Note.edit(uid, previousNote.metadata.note_id, previousNote.metadata.$id, {
                  content: currentNote.content
                }),
                Note.rename(uid, previousNote.metadata.$id, currentNote.title)
              ])
              .then(function () {
                Sync(uid)
              })
              .catch(function () {
                Notification.notify('error', Response.notes['notes/update-failed'])
              })
          }

          if (currentNote.title && !currentNote.content) {
            return Note
              .rename(uid, previousNote.metadata.$id, currentNote.title)
              .then(function () {
                Sync(uid)
              })
              .catch(function () {
                Notification.notify('error', Response.notes['notes/rename-failed'])
              })
          }

          if (!currentNote.title && currentNote.content) {
            return Note
              .edit(uid, previousNote.metadata.note_id, previousNote.metadata.$id, {
                content: currentNote.content
              })
              .then(function () {
                Sync(uid)
              })
              .catch(function () {
                Notification.notify('error', Response.notes['notes/update-failed'])
              })
          }
        }
      }
    }

    function CopyShareLink (noteId, metaId, isSharedWithUser, message) {
      var uid = vm.currentUser.$id
      var shareLink = $location.host() + '/note/d/' + noteId + '?uid=' + uid + '&meta_id=' + metaId + '&shared=' + isSharedWithUser

      if (!clipboard.supported) {
        vm.CopyNotSupported = true
        Notification.notify('error', Response.notes['notes/copy-not-supported'])
      }

      try {
        clipboard.copyText(shareLink)
        Notification.notify('simple', message)
      } catch (error) {
        Notification.notify('error', Response.notes['notes/copy-failed'])
      }
    }

    function ShareNote (note) {
      vm.currentNote = note
      var uid = vm.currentUser.$id

      function filterFunc (users) {
        return users.map(function (user) {
          return {
            email: user.email,
            name: user.name,
            image: user.image,
            uid: user.$id
          }
        })
      }

      $q
        .all([
          User.find(uid),
          Note.allShare(uid, note.metadata.$id),
          User.all()
        ])
        .then(function (response) {
          vm.Owner = response[0]
          vm.ShareWith = filterFunc(response[1])
          cachedUsers = filterFunc(response[2]).filter(function (user) {
            return user.uid !== uid
          })
          vm.shareLoading = false
        })
        .catch(function () {
          Notification.notify('error', Response.notes['notes/loading-failed'])
        })

      LxDialogService.open(vm.dialogShareId)
    }

    function findShareWithUser (userField) {
      vm.addUser = cachedUsers.filter(function (user) {
        if (user.email === userField.trim()) {
          Notification.notify('simple', user.email + ' will be added')
          return user
        }
      })
    }

    function ShareWithUser (user, note) {
      var uid = vm.currentUser.$id
      vm.selectedShareUser = ''

      if (!user) {
        return
      }

      if (user && !user.length) {
        return Notification.notify('simple', 'No user to share with')
      }

      CopyShareLink(note.metadata.note_id, note.metadata.$id, true, Response.notes['notes/share-generated'])
      Note
        .share(
          uid,
          note.metadata.note_id,
          note.metadata.$id,
          user[0].uid
        )
        .then(function (data) {
          Sync(uid)
        })
        .catch(function () {
          Notification.notify('error', Response.notes['notes/update-failed'])
        })
    }

    function RemoveShareWithUser (user, note) {
      var uid = vm.currentUser.$id
      var sharedWithMeId = note.metadata.share_with[user.uid].share_id

      Note
        .removeShare(
          uid,
          note.metadata.note_id,
          note.metadata.$id,
          user.uid,
          sharedWithMeId
        )
        .then(function (data) {
          Sync(uid)
        })
        .catch(function () {
          Notification.notify('error', Response.notes['notes/update-failed'])
        })
    }

    function GetShareLink (note, noteIsPublic) {
      var uid = vm.currentUser.$id

      if (!noteIsPublic) {
        CopyShareLink(note.metadata.note_id, note.metadata.$id, false, Response.notes['notes/copy-success'])
      }

      Note
        .edit(uid, note.metadata.note_id, note.metadata.$id, {
          isPublic: !noteIsPublic,
          type: 'share'
        })
        .then(function (data) {
          if (!noteIsPublic) {
            Notification.notify('simple', Response.notes['notes/share-generated'])
          } else {
            Notification.notify('simple', Response.notes['notes/share-disabled'])
          }

          Sync(uid)
        })
        .catch(function () {
          Notification.notify('error', Response.notes['notes/update-failed'])
        })
    }

    function MakeCopy (note) {
      var tags = []

      if (note.metadata.tags && note.metadata.tags.length) {
        tags = note.metadata.tags.map(function (id) { return { tag_id: id } })
      }

      Create({
        'title': note.metadata.title,
        'content': note.content,
        'settings': {
          'color': note.settings.color
        },
        'tags': tags
      })
    }

    function ShowTags (note, tags) {
      vm.currentNote = note
      vm.shareLoading = true
      LxDialogService.open(vm.dialogTagId)

      if (tags && tags.length) {
        var promises = []

        for (var i = 0; i < tags.length; i++) {
          promises.push(
            Tag.find(
              tags[i]
            )
          )
        }

        $q
          .all(promises)
          .then(function (data) {
            vm.NoteTags = data.map(function (tag) {
              return {
                'tag_id': tag.$id,
                'title': tag.title
              }
            })

            vm.shareLoading = false
          })
          .catch(function () {
            Notification.notify('error', 'Error fetching tags')
          })
      } else {
        vm.shareLoading = false
      }
    }

    function RemoveTag (note, tag) {
      // console.log(note, tag)
    }

    function transformNewTag (_newValue) {
      // vm.shareLoading = true

      // return Tag
      //   .add(_newValue)
      //   .then(function (data) {
      //     vm.shareLoading = false

      //     return {
      //       title: _newValue,
      //       tag_id: data.tagId
      //     }
      //   })
      //   .catch(function () {
      //     Notification.notify('error', 'Error adding tag')
      //   })
    }

    // var events = ['trixInitialize', 'trixChange', 'trixSelectionChange', 'trixFocus', 'trixBlur', 'trixFileAccept', 'trixAttachmentAdd', 'trixAttachmentRemove']

    // for (var i = 0 i < events.length i++) {
    //   vm[events[i]] = function (e) {
    //     console.info('Event type:', e.type, e)
    //   }
    // }

    function FileAccept (event) {
      if (event.file && (event.file.size > SUGG_COMMON.MAX_FILE_SIZE)) {
        event.preventDefault()
        Notification.notify('error', Response.storage['storage/file-size-large'])
      }

      if (event.file && !(/^image/.test(event.file.type))) {
        event.preventDefault()
        Notification.notify('error', Response.storage['storage/accept-image-only'])
      }
    }

    function UploadPick (file, className) {
      var element = 'trix-editor'

      if (className) {
        element = 'trix-editor' + className
      }

      document.querySelector(element).editor.insertFile(file)
    }

    function UploadDrop (event) {
      var attachment = event.attachment

      if (attachment.file) {
        return uploadAttachment(attachment)
      }
    }

    function RemoveUpload (event) {
      var attachment = event.attachment
      var uid = vm.currentUser.$id

      if (attachment.file) {
        var file = attachment.file
      }

      Storage
        .remove(uid, file.name)
        .catch(function (error) {
          console.log(error)
          Notification.notify('error', Response.storage['storage/delete-failed'])
        })
    }

    function uploadAttachment (attachment) {
      var uid = vm.currentUser.$id
      var file = attachment.file

      Storage
        .add(uid, file, file.name, {
          contentType: file.type,
          customMetadata: {
            owner: uid
          }
        })
        .then(
          storageCallback,
          null,
          progressCallback
        )
        .then(function (snapshot) {
          const url = snapshot[0]

          successCallback({
            url: url,
            href: url + '&content-disposition=attachment'
          })
        })
        .catch(function () {
          Notification.notify('error', Response.storage['storage/upload-failed'])
        })

      function progressCallback (progress) {
        attachment.setUploadProgress(progress)
      }

      function successCallback (attributes) {
        attachment.setAttributes(attributes)
      }

      function storageCallback (snapshot) {
        return Storage.get(uid, file.name)
      }
    }
  }

  angular
    .module('sugg.controllers')
    .controller('NotesController', NotesController)

  NotesController.$inject = ['$location', '$q', '$state', '$controller', '$timeout', 'cfpLoadingBar', 'Upload', '$scope', '$localStorage', 'LxDialogService', 'clipboard', 'Note', 'Notification', 'Settings', 'Response', 'Tag', 'User', 'Storage', 'sharedWithMe', 'SUGG_FEATURE_FLAG', 'SUGG_COMMON', 'currentAuth', 'pinned']
})()
