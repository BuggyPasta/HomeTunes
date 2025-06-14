class FileSystem {
    constructor() {
        this.folderCache = new Map();
        this.lastScan = 0;
        this.scanInterval = 5 * 60 * 1000; // 5 minutes
    }

    async scanFolder(path = '') {
        try {
            const response = await fetch(`/api/scan?path=${encodeURIComponent(path)}`);
            if (!response.ok) throw new Error('Failed to scan folder');
            
            const data = await response.json();
            this.folderCache.set(path, {
                folders: data.folders,
                files: data.files,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('Error scanning folder:', error);
            throw error;
        }
    }

    async getFolderContents(path = '') {
        const cached = this.folderCache.get(path);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < this.scanInterval) {
            return cached;
        }

        return this.scanFolder(path);
    }

    async findMP3Files(query = '') {
        try {
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Failed to search files');
            
            return await response.json();
        } catch (error) {
            console.error('Error searching files:', error);
            throw error;
        }
    }

    async getNextFile(currentFile) {
        const folder = currentFile.split('/').slice(0, -1).join('/');
        const contents = await this.getFolderContents(folder);
        
        const currentIndex = contents.files.indexOf(currentFile);
        if (currentIndex === -1 || currentIndex === contents.files.length - 1) {
            // Get next folder
            const folders = await this.getAllFolders();
            const currentFolderIndex = folders.indexOf(folder);
            const nextFolder = folders[currentFolderIndex + 1] || folders[0];
            
            const nextContents = await this.getFolderContents(nextFolder);
            return nextContents.files[0];
        }
        
        return contents.files[currentIndex + 1];
    }

    async getPreviousFile(currentFile) {
        const folder = currentFile.split('/').slice(0, -1).join('/');
        const contents = await this.getFolderContents(folder);
        
        const currentIndex = contents.files.indexOf(currentFile);
        if (currentIndex <= 0) {
            // Get previous folder
            const folders = await this.getAllFolders();
            const currentFolderIndex = folders.indexOf(folder);
            const prevFolder = folders[currentFolderIndex - 1] || folders[folders.length - 1];
            
            const prevContents = await this.getFolderContents(prevFolder);
            return prevContents.files[prevContents.files.length - 1];
        }
        
        return contents.files[currentIndex - 1];
    }

    async getRandomFile(currentFolder) {
        const contents = await this.getFolderContents(currentFolder);
        const files = contents.files.filter(file => !stateManager.state.randomHistory.includes(file));
        
        if (files.length === 0) {
            // Reset history if all files have been played
            stateManager.state.randomHistory = [];
            return contents.files[Math.floor(Math.random() * contents.files.length)];
        }
        
        const randomFile = files[Math.floor(Math.random() * files.length)];
        stateManager.addToRandomHistory(randomFile);
        return randomFile;
    }

    async getAllFolders() {
        try {
            const response = await fetch('/api/folders');
            if (!response.ok) throw new Error('Failed to get folders');
            
            return await response.json();
        } catch (error) {
            console.error('Error getting folders:', error);
            throw error;
        }
    }

    clearCache() {
        this.folderCache.clear();
        this.lastScan = 0;
    }
}

// Initialize file system
const fileSystem = new FileSystem(); 