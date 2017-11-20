"use strict";

angular
  .module('znote.services')
  .factory('Note', ['Refs', '$q', '$rootScope', '$firebaseArray', '$firebaseObject',
    function(Refs, $q, $rootScope, $firebaseArray, $firebaseObject) {
      var time = Firebase.ServerValue.TIMESTAMP;

      return {
        create: function(uid, title, body, settings) {
          var deferred = $q.defer();
          var notes = $firebaseArray(Refs.notes);

          notes.$add({
            'content': body,
            'lang': 'html',
            'settings': settings
          }).then(function(ref) {
            var noteId = ref.key();

            if (noteId) {
              var metadata = $firebaseArray(Refs.users.child(uid).child('metadata'));

              metadata.$add({
                'note_id': noteId,
                'title': title,
                'created': time,
                'updated': time,
                'is_public': false
              }).then(function(ref) {
                deferred.resolve({ metadataId: ref.key(), noteId: noteId });
              })
              .catch(function(err) {
                deferred.reject(err);
              });
            } else {
              deferred.reject(new Error('Error occurred'));
            }
          })
          .catch(function(err) {
            deferred.reject(err);
          });

          return deferred.promise;
        },

        notes: function() {
          var deferred = $q.defer();
          var data = $firebaseArray(Refs.notes);

          data.$loaded()
            .then(function(data) {
              deferred.resolve(data);
            })
            .catch(function(err) {
              deferred.reject(err);
            });

          return deferred.promise;
        },

        metadata: function(uid) {
          var deferred = $q.defer();
          var data = $firebaseArray(Refs.users.child(uid).child('metadata'));

          data.$loaded()
            .then(function(data) {
              deferred.resolve(data);
            })
            .catch(function(err) {
              deferred.reject(err);
            });

          return deferred.promise;
        },

        all: function(uid) {
          var deferred = $q.defer();
          var qry1 = $firebaseArray(Refs.users.child(uid).child('metadata'));
          var _this = this;

          _this.result = [];
          _this.note;

          qry1.$loaded()
            .then(function(data) { return data; })
            .then(function(metadata) {
              var qry2 = $firebaseArray(Refs.notes);

              return qry2.$loaded()
                .then(function(notes) {
                  return { 'metadata': metadata, 'notes': notes };
                });
            })
            .then(function(data) {
              if (data.notes.length > 0 && data.metadata.length > 0) {
                _.each(data.metadata, function(metadata, key) {
                  _this.note = _.find(data.notes, { $id: metadata.note_id });
                  _this.note['metadata'] = metadata;
                  _this.result.push(_this.note);

                  if ((key + 1) === data.metadata.length) {
                    deferred.resolve(_this.result);
                  }
                });
              } else {
                deferred.resolve([]);
              }
            })
            .catch(function(error) {
              deferred.reject(error);
            });

          return deferred.promise;
        },

        findNote: function(noteId) {
          var deferred = $q.defer();
          var data = $firebaseObject(Refs.notes.child(noteId));

          if (!_.isEmpty(data)) {
            data.$loaded()
              .then(function(note) {
                deferred.resolve(note);
              })
              .catch(function(err) {
                deferred.reject(err);
              });
          } else {
            deferred.reject('Note not found.');
          }

          return deferred.promise;
        },

        findMetadata: function(uid, metadataId) {
          var deferred = $q.defer();
          var data = $firebaseObject(Refs.users.child(uid).child('metadata').child(metadataId));

          if (!_.isEmpty(data)) {
            data.$loaded()
              .then(function(metadata) {
                deferred.resolve(metadata);
              })
              .catch(function(error) {
                deferred.reject(error);
              });
          } else {
            deferred.reject('Metadata not found.');
          }

          return deferred.promise;
        },

        remove: function(uid, noteId, metadataId) {
          var deferred = $q.defer();
          var _this = this;

          _this.findNote(noteId).then(function(note) {
            _this.findMetadata(uid, metadataId).then(function(metadata) {

              $q.all([metadata.$remove(), note.$remove()])
                .then(function(metaRef, noteRef) {
                  deferred.resolve([metaRef, noteRef])
                })
                .catch(function(error) {
                  deferred.reject(error);
                });
            })
            .catch(function(error) {
              deferred.reject(error);
            });
          })
          .catch(function(error) {
            deferred.reject(error);
          });

          return deferred.promise;
        },

        edit: function(uid, noteId, metadataId, options) {
          var deferred = $q.defer();
          var _this = this;

          _this.findNote(noteId).then(function(note) {
            _this.findMetadata(uid, metadataId).then(function(metadata) {
              note.settings.color = options.color;
              metadata.updated = time;

              $q.all([note.$save(), metadata.$save()])
                .then(function(noteRef, metaRef) {
                  deferred.resolve([noteRef, metaRef])
                })
                .catch(function(error) {
                  deferred.reject(error);
                });
            })
            .catch(function(error) {
              deferred.reject(error);
            });
          })
          .catch(function(error) {
            deferred.reject(error);
          });

          return deferred.promise;
        },

        // TODO: rename note
        rename: function(uid, noteId, title) {
          var deferred = $q.defer();
          var qry = Refs.users.child(uid).child('metadata').child(noteId);

          if (qry) {
            qry.$update({ 'title': title, 'updated_at': time });

            deferred.resolve();
          } else {
            deferred.reject(new Error('An Error occurred'));
          }

          return deferred.promise;
        },

        sync: function(uid) {
          var Notes = $firebaseArray(Refs.notes);
          var metadata = $firebaseArray(Refs.users.child(uid).child('metadata'));
          var _this = this;

          Notes.$watch(function(e) {
            if (e.event === 'child_removed') {
              _this.all(uid)
                .then(function(notes) {
                  _this.prepForBroadcast("syncedNotes", notes);
                })
                .catch(function(err) {
                  _this.prepForBroadcast("syncedNotes", []);
                });
            }
          });

          metadata.$watch(function(e) {
            if (e.event === 'child_changed') {
              _this.all(uid)
                .then(function(notes) {
                  _this.prepForBroadcast("syncedNotes", notes);
                })
                .catch(function(err) {
                  _this.prepForBroadcast("syncedNotes", []);
                });
            }
          });
        },

        prepForBroadcast: function(key, msg) {
          var _this = this;

          _this[key] = msg;
          _this.broadcastItem(_this);
        },

        broadcastItem: function(data) {
          $rootScope.$broadcast('handleBroadcast', data);
        }
      };
  }]);
