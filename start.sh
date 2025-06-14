#!/bin/bash

# Clone the repository
git clone --depth 1 https://github.com/BuggyPasta/HomeTunes.git /app

# Mount NAS share based on type
if [ "$SHARE_TYPE" = "nfs" ]; then
    mount -t nfs -o ro "$SHARE_HOST:$SHARE_SHARE" /music
elif [ "$SHARE_TYPE" = "smb" ]; then
    if [ -z "$SHARE_USERNAME" ] || [ -z "$SHARE_PASSWORD" ]; then
        echo "Error: SHARE_USERNAME and SHARE_PASSWORD are required for SMB"
        exit 1
    fi
    mount -t cifs -o ro,username="$SHARE_USERNAME",password="$SHARE_PASSWORD" "//$SHARE_HOST$SHARE_SHARE" /music
else
    echo "Invalid SHARE_TYPE. Must be 'nfs' or 'smb'"
    exit 1
fi

# Check if the share is accessible
if [ -d "/music" ] && [ "$(ls -A /music 2>/dev/null)" ]; then
    echo "✅ SHARE MOUNT SUCCESS: /music is accessible."
else
    echo "❌ SHARE MOUNT FAILURE: /music is NOT accessible. Check your NAS, .env, and Docker volume settings."
fi

# Start nginx
nginx -g 'daemon off;' 