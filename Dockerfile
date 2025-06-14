FROM debian:bookworm-slim

# Install required packages
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p /data

# Copy application files
COPY . /app

# Set up nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set up startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Set working directory
WORKDIR /app

# Expose port
EXPOSE 12777

# Start nginx
CMD ["/start.sh"] 