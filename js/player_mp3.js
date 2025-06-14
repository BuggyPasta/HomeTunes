class MP3Player {
    constructor() {
        this.audio = new Audio();
        this.currentTrack = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Audio event listeners
        this.audio.addEventListener('timeupdate', this.handleTimeUpdate.bind(this));
        this.audio.addEventListener('ended', this.handleTrackEnd.bind(this));
        this.audio.addEventListener('error', this.handleError.bind(this));

        // Control button listeners
        document.getElementById('play-pause').addEventListener('click', this.togglePlay.bind(this));
        document.getElementById('previous').addEventListener('click', this.playPrevious.bind(this));
        document.getElementById('next').addEventListener('click', this.playNext.bind(this));
        document.getElementById('rewind10').addEventListener('click', () => this.seek(-10));
        document.getElementById('forward10').addEventListener('click', () => this.seek(10));
        document.getElementById('shuffle').addEventListener('click', this.playShuffle.bind(this));
        document.getElementById('download').addEventListener('click', this.downloadCurrentTrack.bind(this));
        document.getElementById('back').addEventListener('click', () => stateManager.setMode('home'));
        document.getElementById('home').addEventListener('click', () => stateManager.setMode('home'));

        // Mini-player control listener
        document.getElementById('mini-expand').addEventListener('click', () => stateManager.setMode('mp3'));

        // State change listener
        window.addEventListener('stateChange', (event) => {
            if (event.detail.type === 'mode' && event.detail.state.currentMode === 'mp3') {
                this.handleModeChange();
            }
        });
    }

    async handleModeChange() {
        if (stateManager.state.lastFolder) {
            const contents = await fileSystem.getFolderContents(stateManager.state.lastFolder);
            if (contents.files.length > 0) {
                const lastFile = stateManager.state.lastTrack || contents.files[0];
                await this.play(lastFile);
            }
        }
    }

    async loadTrack(track) {
        try {
            this.currentTrack = track;
            this.audio.src = `/music/${track}`;
            
            // Load metadata
            const metadata = await metadataHandler.getMP3Metadata(track);
            this.updateUI(metadata);

            // Resume from last position if it's the same track
            if (stateManager.state.lastPosition > 0 && 
                stateManager.state.lastFolder === this.getCurrentFolder()) {
                this.audio.currentTime = stateManager.state.lastPosition;
            }

            // Save current track and folder
            stateManager.setCurrentTrack(track);
            stateManager.setLastFolder(this.getCurrentFolder());

            return true;
        } catch (error) {
            console.error('Error loading track:', error);
            return false;
        }
    }

    async play(track) {
        const success = await this.loadTrack(track);
        if (success) {
            try {
                await this.audio.play();
                stateManager.setPlaying(true);
                this.updatePlayPauseButton();
            } catch (error) {
                console.error('Error playing track:', error);
            }
        }
    }

    pause() {
        this.audio.pause();
        stateManager.setPlaying(false);
        this.updatePlayPauseButton();
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play();
            stateManager.setPlaying(true);
        } else {
            this.audio.pause();
            stateManager.setPlaying(false);
        }
        this.updatePlayPauseButton();
    }

    seek(seconds) {
        const newTime = this.audio.currentTime + seconds;
        this.audio.currentTime = Math.max(0, Math.min(newTime, this.audio.duration));
    }

    async playShuffle() {
        const currentFolder = this.state.currentFolder;
        const randomFile = await fileSystem.getRandomFile(currentFolder);
        if (randomFile) {
            await this.play(randomFile);
        }
    }

    async playPrevious() {
        if (!this.currentTrack) return;
        
        const previousFile = await fileSystem.getPreviousFile(this.currentTrack);
        if (previousFile) {
            await this.play(previousFile);
        }
    }

    async playNext() {
        if (!this.currentTrack) return;
        
        const nextFile = await fileSystem.getNextFile(this.currentTrack);
        if (nextFile) {
            await this.play(nextFile);
        }
    }

    downloadCurrentTrack() {
        if (this.currentTrack) {
            const link = document.createElement('a');
            link.href = `/music/${this.currentTrack}`;
            link.download = this.currentTrack.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    handleTimeUpdate() {
        // Update progress bar
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        document.querySelector('.progress').style.width = `${progress}%`;

        // Save position
        stateManager.setLastPosition(this.audio.currentTime);
    }

    handleTrackEnd() {
        this.playNext();
    }

    handleError(error) {
        console.error('Playback error:', error);
        this.playNext(); // Skip to next track on error
    }

    updateUI(metadata) {
        document.getElementById('artist').textContent = metadata.artist;
        document.getElementById('title').textContent = metadata.title;
        document.getElementById('mini-artist').textContent = metadata.artist;
        document.getElementById('mini-title').textContent = metadata.title;

        // Update artwork
        const artworkPath = this.getCurrentFolder() + '/folder.jpg';
        const artworkImg = document.getElementById('current-artwork');
        
        // Try to load folder.jpg, fall back to song.svg if it fails
        artworkImg.onerror = () => {
            artworkImg.src = 'icons/song.svg';
        };
        artworkImg.src = `/music/${artworkPath}`;
    }

    updatePlayPauseButton() {
        const button = document.getElementById('play-pause');
        const icon = button.querySelector('img');
        icon.src = this.audio.paused ? 'icons/play.svg' : 'icons/pause.svg';
    }

    getCurrentFolder() {
        if (!this.currentTrack) return '';
        return this.currentTrack.split('/').slice(0, -1).join('/');
    }
}

// Initialize MP3 player
const mp3Player = new MP3Player(); 