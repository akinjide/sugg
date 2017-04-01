"use strict";

angular
  .module('znote.services')
  .factory('Note', ['Refs', '$q', '$rootScope', '$firebaseArray', '$firebaseObject', '$localStorage',
    function(Refs, $q, $rootScope, $firebaseArray, $firebaseObject, $localStorage) {
      var time = Firebase.ServerValue.TIMESTAMP;

      return {
        create: function(uid, title, body, color) {
          var deferred = $q.defer();
          var notes = $firebaseArray(Refs.notes);

          notes.$add({ 'content': body, 'lang': 'html', 'color': color })
            .then(function(ref) {
              var noteId = ref.key();

              if (noteId) {
                var metadata = $firebaseArray(Refs.users.child(uid).child('metadata'));

                metadata.$add({ 'note_id': noteId, 'title': title, 'created': time, 'updated': time })
                  .then(function(ref) {
                    var metadataId = ref.key();
                    deferred.resolve({ metadataId: metadataId, noteId: noteId });
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

//           var id = qry.$ref().push({
//             'content': body,
//             'lang': 'html'
//           }).key();
//
//           if (id) {
//             var qry1 = $firebaseArray(Refs.users.child(currentUser.$id).child('metadata'));
//
//             qry1.$ref().push({
//               'id': id,
//               'title': title,
//               'created': time
//             });
//
//             deferred.resolve(id);
//           } else {
//             deferred.reject(new Error('An Error occurred'));
//           }
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
                .then(function(notes) { return { 'metadata': metadata, 'notes': notes }; });
            })
            .then(function(data) {
              if (data.notes && data.metadata) {
                for (var i = 0; i < data.metadata.length; i++) {
                  _this.note = _.find(data.notes, { $id: data.metadata[i].note_id });
                  _this.note['metadata'] = data.metadata[i];
  //                         note = _.extend(metadata[i], _.pick(notes[i], ['content']));
                  _this.result.push(_this.note);
                }
              } else {
                _this.result = [];
              }

              deferred.resolve(_this.result);
            })
            .catch(function(err) {
              deferred.reject(err);
            });

          return deferred.promise;
        },
        // TODO: filter by date
        byDate: function(date, cb) {
          var qry = Refs.notes.child(date);

          if(!cb){
            return $firebaseArray(qry);
          } else {
            qry.on('value', function(snap){
              cb(snap.val());
            });
          }
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
              .catch(function(err) {
                deferred.reject(err);
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
              metadata.$remove().then(function(metaRef) {
                note.$remove().then(function(noteRef) {
                  deferred.resolve({ id: [metaRef, noteRef], message: 'Data has been deleted locally and in the database' });
                })
                .catch(function(err) {
                  deferred.reject(err);
                });
              })
              .catch(function(err) {
                deferred.reject(err);
              });
            })
            .catch(function(err) {
              deferred.reject(err);
            });
          })
          .catch(function(err) {
            deferred.reject(err);
          });

          return deferred.promise;
        },

        // TODO: edit note
        edit: function(uid, noteId) {

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
        }
      };
  }]);
