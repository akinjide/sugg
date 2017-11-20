"use strict";

angular
  .module('znote.services')
  .factory('Notification', ['LxNotificationService', '$log', function(LxNotificationService, $log) {
    return {
      /**
        * type: notification type.
        * message: message to show.
        * icon: add icon to message
        * sticky: true if notification show stay.
        * color: add color to icon.
        */
      notify: function(type, message, icon, sticky, color) {
        if (type === 'simple') {
          LxNotificationService.notify(message);
        }
        else if (type === 'sticky') {
          LxNotificationService.notify(message, icon, sticky);
        }
        else if (type === 'icon') {
          LxNotificationService.notify(message, icon);
        }
        else if (type === 'color') {
          LxNotificationService.notify(message, icon, sticky, color);
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
      },

      alertBox: function(title, message, promptMessage, callbackMessage) {
        LxNotificationService.alert(title, message, promptMessage, function(answer) {
            LxNotificationService.notify(callbackMessage);
            return answer;
        });
      },

      confirmBox: function(title, message) {
        LxNotificationService.confirm(title, message, {
          cancel: 'Disagree',
          ok: 'Agree'
        }, function(answer) {
          if (answer) {
            LxNotificationService.success('Agree');
          } else {
            LxNotificationService.error('Disagree');
          }
        });
      }
    };
  }]);