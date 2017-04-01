{
  "rules": {
    ".read": "true",
    ".write": "true",
    "users": {
      ".read": true,
      ".indexOn": "email",
      "$user_id": {
        ".write": "$user_id === auth.uid"
      }
    }
  }
}


{
  "rules": {
    "emails": {
      ".read": false,
      ".write": "auth != null"
    },
    "textMessages": {
      ".read": false,
      ".write": "auth != null"
    },
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
{
  "rules": {
    "notes": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      "$user_id": {
        ".read": "auth != null && auth.uid == $user_id",
        ".write": "auth != null && auth.uid == $user_id"
      }
    }
  }
}