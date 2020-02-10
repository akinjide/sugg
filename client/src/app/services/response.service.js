'use strict'

angular
  .module('sugg.services')
  .factory('Response', [function () {
    return {
      core: {
        'core/page-loading-failed': 'Error while loading. Try again',
        'core/internal-server-failed': 'It\'s our fault. Please try again \\_(ツ)_/'
      },
      storage: {
        'storage/file-size-large': 'File too large',
        'storage/accept-image-only': 'Images only',
        'storage/delete-failed': 'File not delete. Try again',
        'storage/upload-failed': 'An error occurred while uploading. Try again'
      },
      auth: {
        'auth/log-out-success': 'Successfully signed out',
        'auth/email-update-success': 'Successfully added email',
        'auth/login-required': 'Please login and try again',
        'auth/account-deactivated-scheduled': 'Account deactivate and scheduled for deletion successfully. :( Sad to see you leave',
        'auth/account-deactivated-already-scheduled': 'Login failed. This account has been deactivated and scheduled for deletion. Contact Support',
        'auth/authentication-failed': 'Login failed. Try again',
        'auth/authentication-canceled': 'You cancelled authentication',
        'auth/invalid-authentication-credentials': 'Invalid credentials',
        'auth/unknown-error': 'Unknown error. Try again',
        'auth/authentication-server-error': 'An error occurred while attempting to contact the authentication server',
        'auth/application-unauthorized': 'The user did not authorize the application'
      },
      notes: {
        'notes/copy-not-supported': 'Copy to clipboard not supported',
        'notes/share-generated': 'Share enabled',
        'notes/share-disabled': 'Share disabled',
        'notes/copy-success': 'Copied',
        'notes/create-success': 'Note added',
        'notes/update-success': 'Note updated',
        'notes/rename-success': 'Note renamed',
        'notes/delete-success': 'Note deleted',
        'notes/bulk-delete-success': 'Notes deleted',
        'notes/create-failed': 'Note not created. Try again',
        'notes/update-failed': 'Note not updated. Try again',
        'notes/rename-failed': 'Note not renamed. Try again',
        'notes/delete-failed': 'Note not deleted. Try again',
        'notes/bulk-delete-failed': 'Notes not deleted. Try again',
        'notes/bulk-update-failed': 'Notes not updated. Try again',
        'notes/copy-failed': 'Nothing to copy',
        'notes/loading-failed': 'An error occurred while loading notes. Try again'
      },
      profile: {

      },
      share: {

      }
    }
  }])
