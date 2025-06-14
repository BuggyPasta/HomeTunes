# HomeTunes

A web-based music player application designed to play MP3 files from a local network. Accessible from any device (PC, mobile phone, or tablet) within the same Local Area Network (LAN).

## ⚠️ VERY IMPORTANT SECURITY WARNING ⚠️

HomeTunes is designed **ONLY FOR LOCAL NETWORK USE** and does **NOT** implement **ANY** security measures for Internet exposure. The application:

- Is intended for use on private networks **ONLY**
- Does **NOT** include authentication or encryption for internet access
- Should only be accessed through a secure VPN or Wireguard connection
- Has **NO** user authentication system
- Is best suited for trusted environments like family or close friends

For secure usage:

- Keep the application within your local network
- Use a VPN or Wireguard tunnel for remote access
- Do **NOT** expose the application directly to the internet
- Only share access with people you trust completely

Use of this application is at your own risk.

## Features

### MP3 Player
- Support for MP3 files only
- Basic playback controls:
  * Previous button
  * Rewind 10 seconds button
  * Play/Pause button
  * Forward 10 seconds button
  * Next button
  * Back button
  * Shuffle button
  * Download button
  * Home button
- Auto-advance: Alphabetical → next folder on end-of-list
- Shuffle play: Constrained to current root subfolder
- Remember last played position when paused
- Remember last played position across app/browser closures
- Download preserves original filename
- Skip corrupted/unplayable files automatically
- Fall back to song.svg if folder.jpg/png is corrupted

### Radio Player
- Station List:
  * Vertical buttons (equal width)
  * "Edit Stations" button
  * Drag-and-drop reordering
  * Required fields: name and URL only
  * URL validation
  * Success modal for reachable streams
  * Maximum stations: 100
  * Remember last played station
- Basic Controls:
  * Play/Pause button
  * Back button
  * Home button
- Display Elements:
  * Station name
  * Stream status (Playing/Buffering/Error)
  * Buffering indicator
- Error Handling:
  * Visual indicator for stream errors
  * Auto-retry mechanism
  * Manual retry button
  * Clear error messages

### Search Functionality
- Real-time search as you type
- Search all folders for MP3 files
- Search radio station names
- Search both artist and title for MP3s
- Case-insensitive
- Search within filenames (no ID3 tags)
- Show results as you type
- Results clickable to play immediately
- No filters needed (always search all folders)
- Search UI:
  * Full-width search bar at top
  * No search button required
  * Clear button (X) appears when text is entered
- Search Results:
  * Show only artist and title for MP3s
  * Show station name for radio stations
  * Visual indicator to distinguish between MP3 and radio results
  * Click to play immediately
  * No path information displayed
  * Limit to 100 results
  * Show "More results available" message if more exist

### Mini-Player
- Always visible (not dismissible)
- Fixed height: 60px
- Full width of screen
- No border radius (square edges)
- Semi-transparent dark background
- White text for artist, slightly dimmed for title
- Progress bar in primary color
- Interactive progress bar (clickable to seek)
- Smooth updates
- Visual feedback on hover/touch
- Controls: play/pause and expand only
- Takes you directly back to the full MP3 player screen when expanded

## Deployment with Dockge

### Prerequisites
- Docker and Docker Compose installed
- Dockge instance running
- NAS with NFS or SMB share containing MP3 files

### Steps

1. **Create Stack in Dockge**
   - Name: `hometunes`
   - Build Context: `https://github.com/BuggyPasta/HomeTunes.git`
   - Docker Compose File: Use the following configuration:

```yaml
services:
  hometunes:
    container_name: hometunes
    restart: unless-stopped
    build:
      context: https://github.com/BuggyPasta/HomeTunes.git
      dockerfile: Dockerfile
    labels:
      - "com.centurylinklabs.watchtower.enable=false"
    ports:
      - "12777:12777"
    volumes:
      - /home/user/docker_backup/hometunes:/data
      - ${SHARE_SHARE}:/music:ro
    env_file:
      - ./.env
    security_opt:
      - no-new-privileges
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
    user: "1000:1000"  # Replace with your user:group ID
```

2. **Configure Environment Variables**
   Create a `.env` file with the following content:
   ```
   # Choose either 'nfs' or 'smb' for your NAS type
   SHARE_TYPE=nfs

   # Your NAS IP address (e.g., 192.168.1.100)
   SHARE_HOST=192.168.1.100

   # For NFS: Full path to share (e.g., /mnt/Music)
   # For SMB: Just the share name (e.g., Music)
   SHARE_SHARE=/mnt/Music

   # DELETE THESE TWO LINES IF USING NFS
   # For SMB only: Your NAS username
   SHARE_USERNAME=admin
   # For SMB only: Your NAS password
   SHARE_PASSWORD=yourpassword
   ```

3. **Configure Volumes**
   - `/home/user/docker_backup/hometunes:/data` - For persistent configuration
   - `${SHARE_SHARE}:/music:ro` - For read-only access to your music files

4. **Deploy**
   - Click "Deploy" in Dockge
   - Wait for the container to build and start
   - Access the application at `http://your-server:12777`

### Security Notes
- The application is designed for LAN use only
- No authentication required
- Binding to 12777 on host interface only
- Read-only mounts
- Input sanitization for radio URLs
- No cookies/localStorage for sensitive data
- CORS explicitly disabled
- Container hardening with specific runtime flags

### Performance
- Initial load: < 5 seconds (UI only)
- Search response: < 100ms
- Playback start: < 1 second
- Maximum MP3 files: 10,000
- No maximum folder depth

### Browser Support
- Chrome: 120+
- Firefox: 120+
- Safari: 17+
- Edge: 120+
- No PWA capabilities required
- Responsive design for all screen sizes

## Troubleshooting

### Common Issues

1. **Cannot access NAS**
   - Check NAS credentials in .env file
   - Verify NAS is accessible from the Docker host
   - Check share permissions

2. **Playback Issues**
   - Ensure MP3 files are valid
   - Check network connectivity
   - Verify file permissions

3. **Radio Stream Issues**
   - Verify stream URL is accessible
   - Check stream format compatibility
   - Ensure network allows streaming

### Logs
- Container logs available in Dockge
- Nginx access/error logs in container
- Application logs in browser console

## Authors

BuggyPasta, with lots of help from A.I. because BuggyPasta is otherwise WORTHLESS in programming

## Acknowledgments

- Icons from SVG Repo (Framework7 Line Icons Collection)
- Built with vanilla HTML, CSS, and JavaScript 