'use strict'

angular
  .module('sugg.services')
  .factory('Refs', ['SUGG_KEYS',
    function (SUGG_KEYS) {
      var rootRef = firebase.database().ref()
      var rootStorageRef = firebase.storage().ref()

      return {
        root: rootRef,
        notes: rootRef.child('notes'),
        users: rootRef.child('users'),
        settings: rootRef.child('settings'),
        tags: rootRef.child('tags'),
        images: rootStorageRef.child('images')
      }
    }
  ])
