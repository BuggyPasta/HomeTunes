#!/bin/bash

# Check if the application files are present in /app
if [ -d "/app/index.html" ]; then
    echo "✅ APPLICATION FILES: /app contains the application files."
else
    echo "❌ APPLICATION FILES: /app does not contain the application files. Image build might have failed or files are missing."
    exit 1
fi

# Check if the host music share is accessible
if [ -d "/music" ] && [ "$(ls -A /music 2>/dev/null)" ]; then
    echo "✅ HOST MUSIC SHARE: /music is accessible."
else
    echo "❌ HOST MUSIC SHARE: /music is NOT accessible or empty. Please mount your music folder from the host as read-only to /music."
    exit 1
fi

# Start nginx
nginx -g 'daemon off;' 