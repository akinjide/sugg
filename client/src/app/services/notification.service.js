'use strict'

angular
  .module('sugg.services')
  .factory('Notification', ['LxNotificationService', 'SUGG_FEATURE_FLAG',
    function (LxNotificationService, SUGG_FEATURE_FLAG) {
      return {
        /**
          * type: notification type.
          * message: message to show.
          * icon: add icon to message
          * sticky: true if notification show stay.
          * color: add color to icon.
          */
        notify: function (type, message, icon, sticky, color) {
          if (!SUGG_FEATURE_FLAG.core.notification) return

          switch (type) {
            case 'simple':
              LxNotificationService.notify(message)
              break

            case 'sticky':
              LxNotificationService.notify(message, icon, sticky)
              break

            case 'icon':
              LxNotificationService.notify(message, icon)
              break

            case 'color':
              LxNotificationService.notify(message, icon, sticky, color)
              break

            case 'info':
            case 'success':
            case 'warning':
            case 'error':
              LxNotificationService[type](message)
              break
          }
        },

        confirm: function (type, message, description, callback) {
          if (type === 1) {
            LxNotificationService.confirm(message, description, {
              cancel: 'Disagree',
              ok: 'Agree'
            }, function (answer) {
              callback(answer)
            })
          }
        },

        alertBox: function (title, message, promptMessage, callbackMessage, callback) {
          LxNotificationService.alert(title, message, promptMessage, function (answer) {
            LxNotificationService.notify(callbackMessage)
            callback(answer)
          })
        },

        confirmBox: function (title, message, callback) {
          LxNotificationService.confirm(title, message, {
            cancel: 'Disagree',
            ok: 'Agree'
          }, function (answer) {
            if (answer) {
              LxNotificationService.success('Agree')
            } else {
              LxNotificationService.error('Disagree')
            }

            callback(answer)
          })
        }
      }
    }
  ])
