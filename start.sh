#!/bin/bash

# Only clone the repo if /app does not exist or is empty
if [ ! -d "/app" ] || [ -z "$(ls -A /app 2>/dev/null)" ]; then
    git clone --depth 1 https://github.com/BuggyPasta/HomeTunes.git /app
fi

# Start nginx
nginx -g 'daemon off;' 