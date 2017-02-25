"use strict";

angular
  .module('znote.services')
  .factory('Notification', ['LxNotificationService', function(LxNotificationService) {
    return {
      notify: function(type, message, icon, bool, color) {
        if (type === 'simple') {
          LxNotificationService.notify(message);
        }
        else if (type === 'sticky') {
          LxNotificationService.notify(message, undefined, bool);
        }
        else if (type === 'icon') {
          LxNotificationService.notify(message, icon);
        }
        else if (type === 'color') {
          LxNotificationService.notify(message, undefined, bool, color);
        }
        else if (type === 'info') {
          LxNotificationService.info(message);
        }
        else if (type === 'success') {
          LxNotificationService.success(message);
        }
        else if (type === 'warning') {
          LxNotificationService.warning(message);
        }
        else if (type === 'error') {
          LxNotificationService.error(message);
        }
      },

      confirm: function(type, message, description) {
        if (type === 1) {
          LxNotificationService.confirm(message, description, { cancel:'Disagree', ok:'Agree' },
            function(answer) {
              return answer;
            });
        }
      }
    };
  }]);