#!/bin/bash

set -ex # Exit immediately if a command exits with a non-zero status, and print commands and their arguments as they are executed.

# Check if the host music share is accessible
if [ -d "/music" ] && [ "$(ls -A /music 2>/dev/null)" ]; then
    echo "✅ HOST MUSIC SHARE: /music is accessible."
else
    echo "❌ HOST MUSIC SHARE: /music is NOT accessible or empty. Please mount your music folder from the host as read-only to /music."
    exit 1
fi

# Explicit confirmation before starting Nginx
echo "Attempting to start Nginx..."

# Test Nginx configuration
echo "Running Nginx configuration test..."
nginx -t

# Start nginx
nginx -g 'daemon off;'

echo "✅ HomeTunes container fully initialized and Nginx running." 