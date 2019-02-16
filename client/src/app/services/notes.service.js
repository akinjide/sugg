"use strict";

angular
  .module('sugg.services')
  .factory('Note', ['Refs', 'User', '$q', '$rootScope', '$firebaseArray', '$firebaseObject',
    function(Refs, User, $q, $rootScope, $firebaseArray, $firebaseObject) {
      return {
        create: function(uid, title, body, settings, tags) {
          var deferred = $q.defer();
          var time = firebase.database.ServerValue.TIMESTAMP;

          $firebaseArray(Refs.notes)
            .$add({
              'content': body,
              'lang': 'html',
              'settings': Object.assign(settings, {
                'is_public': false,
                'is_pin': true
              })
            })
            .then(function(ref) {
              var noteId = ref.key;

              if (noteId) {
                var metadata = $firebaseArray(Refs.users.child(uid).child('metadata'));

                return metadata
                  .$add({
                    'note_id': noteId,
                    'title': title,
                    'created': time,
                    'updated': time,
                    'is_public': false,
                    'is_pin': true,
                    'tags': tags.map(function(tag) {
                      return tag.tag_id;
                    })
                  });
              }

              return deferred.reject('error occurred');
            })
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        notes: function() {
          var deferred = $q.defer();

          $firebaseArray(Refs.notes)
            .$loaded()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        metadata: function(uid) {
          var deferred = $q.defer();

          $firebaseArray(Refs.users.child(uid).child('metadata'))
            .$loaded()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        all: function(uid) {
          var deferred = $q.defer();

          $firebaseArray(Refs.users.child(uid).child('metadata'))
            .$loaded()
            .then(function(metadata) {
              return $firebaseArray(Refs.notes)
                .$loaded()
                .then(function(notes) {
                  return {
                    'metadata': metadata,
                    'notes': notes
                  };
                });
            })
             // TODO: loop through metadata tags and add tag title
            .then(function(data) {
              if (data && data.notes && data.metadata) {
                if (data.notes.length > 0 && data.metadata.length > 0) {
                  return data.metadata.map(function(metadata, key) {
                    var note = _.find(data.notes, { $id: metadata.note_id });

                    note.metadata = metadata;
                    note.Selected = false;

                    return note;
                  });
                }
              }

              return [];
            })
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        findNote: function(noteId) {
          var deferred = $q.defer();

          $firebaseObject(Refs.notes.child(noteId))
            .$loaded()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        findMetadata: function(uid, metadataId) {
          var deferred = $q.defer();

          $firebaseObject(Refs.users.child(uid).child('metadata').child(metadataId))
            .$loaded()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        findMetadataShare: function(uid, metadataId, shareUID) {
          var deferred = $q.defer();

          $firebaseObject(Refs.users.child(uid).child('metadata').child(metadataId).child('share_with').child(shareUID))
            .$loaded()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        findNoteShare: function(noteId, shareUID) {
          var deferred = $q.defer();

          $firebaseObject(Refs.notes.child(noteId).child('settings').child('share_with').child(shareUID))
            .$loaded()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        remove: function(uid, noteId, metadataId) {
          var deferred = $q.defer();

          $q.all([
            this
              .findMetadata(uid, metadataId)
              .then(function(metadata) {
                return metadata.$remove();
              }),
            this
              .findNote(noteId)
              .then(function(note) {
                return note.$remove();
              })
          ])
          .then(deferred.resolve)
          .catch(deferred.reject);

          return deferred.promise;
        },

        edit: function(uid, noteId, metadataId, options) {
          var deferred = $q.defer();
          var time = firebase.database.ServerValue.TIMESTAMP;

          $q.all([
            this
              .findNote(noteId)
              .then(function(note) {
                if (options.content) {
                  note.content = options.content;
                }

                if (options.color) {
                  note.settings.color = options.color;
                }

                if (options.type === 'share') {
                  note.settings.is_public = options.isPublic;
                }

                if (options.type === 'pin') {
                  note.settings.is_pin = options.pin;
                }

                return note.$save();
              }),
            this
              .findMetadata(uid, metadataId)
              .then(function(metadata) {
                metadata.updated = time;
                if (options.type === 'share') {
                  metadata.is_public = options.isPublic;
                }

                if (options.type === 'pin') {
                  metadata.is_pin = options.pin;
                }

                return metadata.$save();
              })
          ])
          .then(deferred.resolve)
          .catch(deferred.reject);

          return deferred.promise;
        },

        share: function(uid, noteId, metadataId, shareUID) {
          var deferred = $q.defer();
          var time = firebase.database.ServerValue.TIMESTAMP;
          var noteShare = $firebaseArray(Refs.notes.child(noteId).child('settings').child('share_with').child(shareUID));
          var metadataShare = $firebaseArray(Refs.users.child(uid).child('metadata').child(metadataId).child('share_with').child(shareUID));
          var sharedWith = $firebaseArray(Refs.users.child(shareUID).child('shared_with_me'));

          sharedWith
            .$add({
              shared_at: time,
              read: true,
              write: true,
              note_id: noteId,
              metadata_id: metadataId,
              shared_by: uid
            })
            .then(function(ref) {
              var data = {
                shared_at: time,
                share_id: ref.key,
                read: true,
                write: true
              };

              return $q.all([
                noteShare
                  .$ref()
                  .set(data),
                metadataShare
                  .$ref()
                  .set(data)
              ]);
            })
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        allShare: function(uid, metadataId) {
          var deferred = $q.defer();

          $firebaseArray(Refs.users.child(uid).child('metadata').child(metadataId).child('share_with'))
            .$loaded()
            .then(function(metadata) {
              if (metadata.length > 0) {
                return $q.all(
                  metadata
                    .map(function(meta, key) {
                      return User.find(meta.$id);
                    })
                );
              }

              return [];
            })
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        removeShare: function(uid, noteId, metadataId, shareUID, sharedWithMeId) {
          var deferred = $q.defer();

          $q.all([
            this
              .findMetadataShare(uid, metadataId, shareUID)
              .then(function(metadataShare) {
                return metadataShare.$remove();
              }),
            this
              .findNoteShare(noteId, shareUID)
              .then(function(noteShare) {
                return noteShare.$remove();
              }),
            $firebaseObject(Refs.users.child(shareUID)
              .child('shared_with_me')
              .child(sharedWithMeId))
              .$remove()
          ])
          .then(deferred.resolve)
          .catch(deferred.reject);

          return deferred.promise;
        },

        rename: function(uid, metadataId, title) {
          var deferred = $q.defer();
          var time = firebase.database.ServerValue.TIMESTAMP;

          this
            .findMetadata(uid, metadataId)
            .then(function(metadata) {
              metadata.title = title;
              metadata.updated = time;
              return metadata.$save();
            })
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        sync: function(uid) {
          var self = this;

          $firebaseArray(Refs.notes)
            .$watch(function(e) {
              if (e.event === 'child_removed') {
                self
                  .all(uid)
                  .then(function(notes) {
                    self.prepForBroadcast('syncedNotes', notes);
                  })
                  .catch(function() {
                    self.prepForBroadcast('syncedNotes', []);
                  });
              }
            });

          $firebaseArray(Refs.users.child(uid).child('metadata'))
            .$watch(function(e) {
              if (e.event === 'child_changed') {
                self
                  .all(uid)
                  .then(function(notes) {
                    self.prepForBroadcast('syncedNotes', notes);
                  })
                  .catch(function() {
                    self.prepForBroadcast('syncedNotes', []);
                  });
              }
            });
        },

        prepForBroadcast: function(key, msg) {
          var self = this;
          self[key] = msg;
          self.broadcastItem(self);
        },

        broadcastItem: function(data) {
          $rootScope.$broadcast('handleBroadcast', data);
        }
      };
  }]);
