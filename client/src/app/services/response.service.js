"use strict";

angular
  .module('sugg.services')
  .factory('Response', [function() {
      return {
        success: {
          'share.generated': 'Share enabled',
          'share.disabled': 'Share disabled',
          'copy': 'Copied',
          'note.create': 'Note added',
          'note.update': 'Note updated',
          'note.rename': 'Note renamed',
          'note.delete': 'Note deleted',
          'note.bulk.delete': 'Notes deleted',
          'auth.logout': 'Successfully signed out'
        },
        error: {
          'auth.deactivated': 'Login failed. This account has been deactivated. Contact Support.',
          'auth.login': 'Login failed. Try again',
          'auth.cancel': 'You cancelled authentication.',
          'auth.invalid': 'Invalid credentials',
          'auth.server': 'An error occurred while attempting to contact the authentication server.',
          'auth.unknown': 'Unknown error. Try again',
          'auth.unauthorized': 'The user did not authorize the application.',
          'note.create': 'Note not created. Try again',
          'note.update': 'Note not updated. Try again',
          'note.rename': 'Note not renamed. Try again',
          'note.delete': 'Note not deleted. Try again',
          'note.bulk.delete': 'Notes not deleted. Try again',
          'note.bulk.update': 'Notes not updated. Try again',
          'copy': 'Nothing to copy',
          'page': 'Error while loading. Try again',
          'note.loading': 'An error occurred while loading notes. Try again',
          'server.internal': 'It\'s our fault. Please try again \\_(ツ)_/'
        },
        warn: {
          'auth.required': 'Please Login And Try again',
          'copy.not_supported': 'Copy to clipboard not supported',
          'auth.deactivated': 'Account deactivate successfully. :( Sad to see you leave'
        }
      };
  }]);
