class StateManager {
    constructor() {
        console.log('StateManager: Initializing...');
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
        console.log('StateManager: Initialization complete');
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
        console.log('StateManager: Setting mode to:', mode);
        this.state.currentMode = mode;
        this.saveState();
        this.notifyStateChange('mode');
        
        // Update UI
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(`${mode}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log('StateManager: Screen updated to', mode);
        } else {
            console.error('StateManager: Could not find screen element for mode', mode);
        }
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
        console.log('StateManager: Setting up event listeners...');
        
        const mp3Button = document.getElementById('mp3-mode');
        const radioButton = document.getElementById('radio-mode');
        
        if (!mp3Button || !radioButton) {
            console.error('StateManager: Could not find mode buttons!');
            return;
        }
        
        console.log('StateManager: Found mode buttons, attaching listeners...');
        
        mp3Button.addEventListener('click', (e) => {
            console.log('MP3 Mode button clicked.');
            e.preventDefault();
            this.setMode('mp3');
        });

        radioButton.addEventListener('click', (e) => {
            console.log('Radio Mode button clicked.');
            e.preventDefault();
            this.setMode('radio');
        });

        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
        
        console.log('StateManager: Event listeners setup complete');
    }

    notifyStateChange(type) {
        console.log('StateManager: Notifying state change:', type);
        const event = new CustomEvent('stateChange', {
            detail: { type, state: this.state }
        });
        window.dispatchEvent(event);
    }
}

// Initialize state manager and expose it globally
console.log('StateManager: Creating instance...');
window.stateManager = new StateManager(); 