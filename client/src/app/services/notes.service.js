"use strict";

angular
  .module('znote.services')
  .factory('Notes', ['Refs', '$rootScope', '$firebaseArray', '$firebaseObject',
    function(Refs, $rootScope, $firebaseArray, $firebaseObject) {
      var id;
      var currentUser = $rootScope.currentUser;
      var time = moment();

      return {
        create: function(payload, cb) {
          if (!payload) cb('error');

          var qry = $firebaseArray(Refs.notes);
          var qry1 = $firebaseArray(Refs.users.child(currentUser.$id).child('notes'));

          id = qry.$ref().push({
            'body': payload.body
          }).key();

          qry1.$ref().push({
            'id': id,
            'title': payload.title,
            'created_at': time,
            'updated_at': time
          }, function(err) {
            cb(err);
          });

          qry1.$ref().once('value', function(snap) {
            console.log(snap.val());
          });
        },

        all: function(cb) {
          var qry = Refs.notes;

          if (!cb) {
            return $firebaseArray(qry)
          }
          else {
            qry.on('value', function(snap) {
              e = null;
              if (snap.exists()) {
                cb(e, snap.val());
              }
              else {
                e = 'no data found in the database';
                cb(e)
              }
            });
          }
        },

        allMeta: function(uid, cb) {
          var qry = Refs.users.child(uid).child('notes');

          if (!cb) {
            return $firebaseArray(qry);
          }
          else {
            qry.on('value', function(snap) {
              e = null;
              if (snap.exists()) {
                cb(e, snap.val());
              }
              else {
                e = 'no data found in the database';
                cb(e)
              }
            });
          }
        },

        byDate: function(date, cb){
          var qry = Refs.notes.child(date);

          if(!cb){
            return $firebaseArray(qry);
          } else {
            qry.on('value', function(snap){
              cb(snap.val());
            });
          }
        },

        find: function(noteid, cb) {
          var qry = Refs.notes.child(noteid);

          if (!cb) {
            return $firebaseArray(qry);
          }
          else {
            qry.on('value', function(snap) {
              e = null;
              if (snap.exists()) {
                cb(e, snap.val());
              }
              else {
                e = 'no data found in the database';
                cb(e)
              }
            });
          }
        },

        findMeta: function(uid, noteid, cb) {
          var qry = Refs.users.child(uid).child('notes');

          qry.on('value', function(snap) {
            var notes = snap.val();
            var note _.find(notes, { id: noteid });

            if (!cb) {
              return note;
            } else {
              cb(note)
            }
          });
        },

        remove: function(uid, noteid, cb) {
          Refs.users.child(uid).child('notes').child(noteid).$remove();
          Refs.notes.child(noteid).$remove();
        },

        edit: function(uid, noteid, cb) {

        },

        rename: function(uid, noteid, payload) {
          var qry = Refs.users.child(uid).child('notes').child(noteid);

          qry.$update({ 'title': payload.title, 'updated_at': time });
        }
      };
  }]);
