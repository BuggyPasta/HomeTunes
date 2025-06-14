class RadioPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentStation = null;
        this.setupEventListeners();
        this.loadStations();
    }

    setupEventListeners() {
        // Audio event listeners
        this.audio.addEventListener('playing', this.handlePlaying.bind(this));
        this.audio.addEventListener('waiting', this.handleBuffering.bind(this));
        this.audio.addEventListener('error', this.handleError.bind(this));

        // Control button listeners
        document.getElementById('play-pause').addEventListener('click', this.togglePlay.bind(this));
        document.getElementById('back').addEventListener('click', () => stateManager.setMode('home'));
        document.getElementById('home').addEventListener('click', () => stateManager.setMode('home'));
        document.getElementById('edit-stations').addEventListener('click', this.showEditModal.bind(this));

        // State change listener
        window.addEventListener('stateChange', (event) => {
            if (event.detail.type === 'mode' && event.detail.state.currentMode === 'radio') {
                this.handleModeChange();
            }
        });
    }

    async handleModeChange() {
        if (stateManager.state.currentStation) {
            await this.play(stateManager.state.currentStation);
        } else {
            this.displayStations();
        }
    }

    async loadStations() {
        try {
            const response = await fetch('/api/stations');
            if (!response.ok) throw new Error('Failed to load stations');
            
            const stations = await response.json();
            stateManager.setRadioStations(stations);
            this.displayStations();
        } catch (error) {
            console.error('Error loading stations:', error);
        }
    }

    displayStations() {
        const container = document.getElementById('station-list');
        container.innerHTML = '';

        stateManager.state.radioStations.forEach(station => {
            const button = document.createElement('button');
            button.className = 'station-button';
            button.textContent = station.name;
            button.addEventListener('click', () => this.play(station));
            container.appendChild(button);
        });
    }

    async loadStation(station) {
        try {
            this.currentStation = station;
            this.audio.src = station.url;
            
            // Load metadata
            const metadata = await metadataHandler.getRadioMetadata(station);
            this.updateUI(metadata);

            return true;
        } catch (error) {
            console.error('Error loading station:', error);
            return false;
        }
    }

    async play(station) {
        const success = await this.loadStation(station);
        if (success) {
            try {
                await this.audio.play();
                stateManager.setPlaying(true);
                stateManager.setCurrentStation(station);
                this.updatePlayPauseButton();
            } catch (error) {
                console.error('Error playing station:', error);
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

    handlePlaying() {
        document.getElementById('station-status').textContent = 'Playing';
    }

    handleBuffering() {
        document.getElementById('station-status').textContent = 'Buffering...';
    }

    handleError(error) {
        console.error('Stream error:', error);
        document.getElementById('station-status').textContent = 'Error';
        // Auto-retry after 5 seconds
        setTimeout(() => {
            if (this.currentStation) {
                this.play(this.currentStation);
            }
        }, 5000);
    }

    updateUI(metadata) {
        document.getElementById('artist').textContent = metadata.artist;
        document.getElementById('title').textContent = metadata.title;
        document.getElementById('mini-artist').textContent = metadata.artist;
        document.getElementById('mini-title').textContent = metadata.title;
    }

    updatePlayPauseButton() {
        const button = document.getElementById('play-pause');
        const icon = button.querySelector('img');
        icon.src = this.audio.paused ? 'icons/play.svg' : 'icons/pause.svg';
    }

    showEditModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Edit Radio Stations</h2>
                <div class="station-list" id="edit-station-list"></div>
                <button id="add-station">Add Station</button>
                <button id="save-stations">Save</button>
                <button id="cancel-edit">Cancel</button>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupEditModalListeners(modal);
    }

    setupEditModalListeners(modal) {
        const list = modal.querySelector('#edit-station-list');
        const stations = stateManager.state.radioStations;

        stations.forEach((station, index) => {
            const item = document.createElement('div');
            item.className = 'edit-station-item';
            item.innerHTML = `
                <input type="text" value="${station.name}" class="station-name">
                <input type="text" value="${station.url}" class="station-url">
                <button class="delete-station">×</button>
            `;

            item.querySelector('.delete-station').addEventListener('click', () => {
                item.remove();
            });

            list.appendChild(item);
        });

        modal.querySelector('#add-station').addEventListener('click', () => {
            const item = document.createElement('div');
            item.className = 'edit-station-item';
            item.innerHTML = `
                <input type="text" placeholder="Station Name" class="station-name">
                <input type="text" placeholder="Stream URL" class="station-url">
                <button class="delete-station">×</button>
            `;

            item.querySelector('.delete-station').addEventListener('click', () => {
                item.remove();
            });

            list.appendChild(item);
        });

        modal.querySelector('#save-stations').addEventListener('click', async () => {
            const items = list.querySelectorAll('.edit-station-item');
            const stations = [];

            for (const item of items) {
                const name = item.querySelector('.station-name').value.trim();
                const url = item.querySelector('.station-url').value.trim();

                if (name && url) {
                    // Validate URL
                    try {
                        const response = await fetch(url, { method: 'HEAD' });
                        if (response.ok) {
                            stations.push({ name, url });
                        }
                    } catch (error) {
                        console.error('Invalid station URL:', error);
                    }
                }
            }

            if (stations.length > 100) {
                alert('Maximum 100 stations allowed');
                return;
            }

            stateManager.setRadioStations(stations);
            this.displayStations();
            modal.remove();
        });

        modal.querySelector('#cancel-edit').addEventListener('click', () => {
            modal.remove();
        });
    }
}

// Initialize radio player
const radioPlayer = new RadioPlayer(); 