class StateManager {
    constructor() {
        this.state = {
            currentMode: 'home', // 'home', 'mp3', 'radio'
            currentTrack: null,
            currentStation: null,
            isPlaying: false,
            lastPosition: 0,
            lastFolder: '',
            shuffleHistory: [],
            radioStations: []
        };
        
        this.loadState();
        this.setupEventListeners();
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('hometunes_state');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                this.state = { ...this.state, ...parsed };
            }
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }

    saveState() {
        try {
            localStorage.setItem('hometunes_state', JSON.stringify(this.state));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    setMode(mode) {
        console.log('Setting mode to:', mode);
        this.state.currentMode = mode;
        this.saveState();
        this.notifyStateChange('mode');
        
        // Update UI
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${mode}-screen`).classList.add('active');
    }

    setCurrentTrack(track) {
        this.state.currentTrack = track;
        this.saveState();
        this.notifyStateChange('track');
    }

    setCurrentStation(station) {
        this.state.currentStation = station;
        this.saveState();
        this.notifyStateChange('station');
    }

    setPlaying(isPlaying) {
        this.state.isPlaying = isPlaying;
        this.saveState();
        this.notifyStateChange('playing');
    }

    setLastPosition(position) {
        this.state.lastPosition = position;
        this.saveState();
    }

    setLastFolder(folder) {
        this.state.lastFolder = folder;
        this.saveState();
    }

    addToShuffleHistory(track) {
        this.state.shuffleHistory.unshift(track);
        if (this.state.shuffleHistory.length > 1000) {
            this.state.shuffleHistory.pop();
        }
        this.saveState();
    }

    setRadioStations(stations) {
        this.state.radioStations = stations;
        this.saveState();
        this.notifyStateChange('stations');
    }

    setupEventListeners() {
        document.getElementById('mp3-mode').addEventListener('click', () => {
            console.log('MP3 Mode button clicked.');
            this.setMode('mp3');
        });

        document.getElementById('radio-mode').addEventListener('click', () => {
            console.log('Radio Mode button clicked.');
            this.setMode('radio');
        });

        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
    }

    notifyStateChange(type) {
        const event = new CustomEvent('stateChange', {
            detail: { type, state: this.state }
        });
        window.dispatchEvent(event);
    }
}

// Initialize state manager and expose it globally
window.stateManager = new StateManager(); 