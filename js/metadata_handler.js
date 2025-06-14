class MetadataHandler {
    constructor() {
        this.cache = new Map();
    }

    async getMP3Metadata(file) {
        // Check cache first
        if (this.cache.has(file)) {
            return this.cache.get(file);
        }

        try {
            // Parse filename (Artist - Title.mp3)
            const filename = file.split('/').pop();
            const match = filename.match(/^(.+?)\s*-\s*(.+?)\.mp3$/);
            
            if (!match) {
                return {
                    artist: 'Unknown Artist',
                    title: filename.replace('.mp3', '')
                };
            }

            const metadata = {
                artist: match[1].trim(),
                title: match[2].trim()
            };

            // Cache the result
            this.cache.set(file, metadata);
            return metadata;
        } catch (error) {
            console.error('Error parsing MP3 metadata:', error);
            return {
                artist: 'Unknown Artist',
                title: 'Unknown Title'
            };
        }
    }

    async getRadioMetadata(station) {
        // For radio stations, we'll use the station name as metadata
        return {
            artist: station.name,
            title: 'Live Stream'
        };
    }

    clearCache() {
        this.cache.clear();
    }
}

// Initialize metadata handler
const metadataHandler = new MetadataHandler(); 