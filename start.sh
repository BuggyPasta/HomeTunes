#!/bin/bash

# Check if the host music share is accessible
if [ -d "/music" ] && [ "$(ls -A /music 2>/dev/null)" ]; then
    echo "✅ HOST MUSIC SHARE: /music is accessible."
else
    echo "❌ HOST MUSIC SHARE: /music is NOT accessible or empty. Please mount your music folder from the host as read-only to /music."
    exit 1
fi

# Start nginx
nginx -g 'daemon off;' 