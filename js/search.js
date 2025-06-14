class Search {
    constructor() {
        this.searchInput = document.getElementById('search');
        this.clearButton = document.getElementById('clear-search');
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'search-results';
        this.searchInput.parentNode.appendChild(this.resultsContainer);
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 150));
        this.clearButton.addEventListener('click', this.clearSearch.bind(this));
        
        // Close results when clicking outside
        document.addEventListener('click', (event) => {
            if (!this.searchInput.contains(event.target) && 
                !this.resultsContainer.contains(event.target)) {
                this.clearSearch();
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async handleSearch(event) {
        const query = event.target.value.trim().toLowerCase();
        
        if (query.length === 0) {
            this.clearSearch();
            return;
        }

        this.clearButton.classList.remove('hidden');
        
        try {
            // Search MP3 files
            const mp3Results = await this.searchMP3Files(query);
            
            // Search radio stations
            const radioResults = await this.searchRadioStations(query);
            
            // Combine and limit results
            const results = [...mp3Results, ...radioResults].slice(0, 100);
            
            this.displayResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    async searchMP3Files(query) {
        const results = await fileSystem.findMP3Files(query);
        return results.map(file => ({
            type: 'mp3',
            name: file,
            path: file
        }));
    }

    async searchRadioStations(query) {
        const stations = stateManager.state.radioStations;
        return stations.filter(station => 
            station.name.toLowerCase().includes(query)
        ).map(station => ({
            type: 'radio',
            name: station.name,
            url: station.url
        }));
    }

    displayResults(results) {
        this.resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        const list = document.createElement('ul');
        list.className = 'results-list';

        results.forEach(result => {
            const item = document.createElement('li');
            item.className = 'result-item';
            
            const icon = document.createElement('img');
            icon.src = `icons/${result.type}.svg`;
            icon.alt = result.type;
            
            const name = document.createElement('span');
            name.textContent = result.name;
            
            item.appendChild(icon);
            item.appendChild(name);
            
            item.addEventListener('click', () => this.handleResultClick(result));
            
            list.appendChild(item);
        });

        this.resultsContainer.appendChild(list);
    }

    handleResultClick(result) {
        if (result.type === 'mp3') {
            stateManager.setMode('mp3');
            mp3Player.play(result.path);
        } else {
            stateManager.setMode('radio');
            radioPlayer.play(result);
        }
        this.clearSearch();
    }

    clearSearch() {
        this.searchInput.value = '';
        this.clearButton.classList.add('hidden');
        this.resultsContainer.innerHTML = '';
    }
}

// Initialize search
const search = new Search(); 