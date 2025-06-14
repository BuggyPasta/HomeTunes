FROM debian:bookworm-slim

# Install required packages
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p /data /var/log/nginx /var/lib/nginx

# Set permissions for Nginx logs and temp directories
RUN chown -R www-data:www-data /var/log/nginx /var/lib/nginx

# Clone application files into /app during build
RUN git clone --depth 1 https://github.com/BuggyPasta/HomeTunes.git /app
RUN chown -R www-data:www-data /app
RUN chmod -R 755 /app

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