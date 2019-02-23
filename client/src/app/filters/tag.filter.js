'use strict'

angular
  .module('sugg.filters')
  .filter('tagIt', ['Tag', function (Tag) {
    var title = null
    var cache = {}

    getTitle.$stateful = true

    function filterFunc (title) {
      return title
    }

    function getTitle (input) {
      if (title === null) {
        Tag
          .find(input)
          .then(function (data) {
            title = data.title
            cache[input] = title
          })
      } else {
        return filterFunc(cache[input])
      }
    }

    return getTitle
  }])
