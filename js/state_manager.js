class StateManager {
    constructor() {
        this.state = {
            currentMode: 'home', // 'home', 'mp3', 'radio'
            currentTrack: null,
            currentStation: null,
            isPlaying: false,
            lastPosition: 0,
            lastFolder: '',
            randomHistory: [],
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
        this.state.currentMode = mode;
        this.saveState();
        this.notifyStateChange('mode');
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

    addToRandomHistory(track) {
        this.state.randomHistory.unshift(track);
        if (this.state.randomHistory.length > 1000) {
            this.state.randomHistory.pop();
        }
        this.saveState();
    }

    setRadioStations(stations) {
        this.state.radioStations = stations;
        this.saveState();
        this.notifyStateChange('stations');
    }

    setupEventListeners() {
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

// Initialize state manager
const stateManager = new StateManager(); 