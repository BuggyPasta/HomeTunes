#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status.

echo "Checking network connectivity to GitHub..."
# Check network connectivity (e.g., ping GitHub, timeout after 5 seconds)
if ! ping -c 1 -W 5 github.com &> /dev/null; then
    echo "❌ Network connectivity to GitHub failed. Cannot clone repository."
    exit 1
fi
echo "✅ Network connectivity to GitHub OK."

# Only clone the repo if /app does not exist or is empty
if [ ! -d "/app" ] || [ -z "$(ls -A /app 2>/dev/null)" ]; then
    echo "Cloning HomeTunes repository into /app..."
    # Use GIT_TERMINAL_PROMPT=0 to prevent interactive prompts
    # Use timeout to prevent indefinite hangs (e.g., 60 seconds)
    if ! GIT_TERMINAL_PROMPT=0 timeout 60 git clone --depth 1 https://github.com/BuggyPasta/HomeTunes.git /app; then
        echo "❌ Git clone failed or timed out."
        exit 1
    fi
    echo "✅ Repository cloned successfully."
else
    echo "/app directory already contains content. Skipping git clone."
fi

# Start nginx
echo "Starting Nginx..."
nginx -g 'daemon off;' 