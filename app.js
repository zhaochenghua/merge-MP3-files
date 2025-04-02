// Global variables
let ffmpeg = null;
let ffmpegLoaded = false; // Track if FFmpeg is fully loaded
let folderStructure = {}; // Stores the folder structure and MP3 files

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Set up drag and drop for the dropzone
    setupDropzone();
    
    // Set up file input for folder selection
    setupFolderInput();
    
    // Initialize FFmpeg
    await initFFmpeg();
});

// Initialize FFmpeg.wasm
async function initFFmpeg() {
    try {
        ffmpeg = new FFmpeg.createFFmpeg({ log: true });
        await ffmpeg.load();
        ffmpegLoaded = true; // Set the flag to indicate FFmpeg is loaded
        console.log('FFmpeg is ready!');
    } catch (error) {
        console.error('Error initializing FFmpeg:', error);
        ffmpegLoaded = false; // Ensure flag is false on error
        showError('Failed to initialize FFmpeg. Please try again or use a different browser.');
    }
}

// Set up the dropzone for folder drag and drop
function setupDropzone() {
    const dropzone = document.getElementById('folder-dropzone');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight dropzone when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.add('highlight');
        }, false);
    });
    
    // Remove highlight when dragging leaves
    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.remove('highlight');
        }, false);
    });
    
    // Handle dropped items
    dropzone.addEventListener('drop', handleDrop, false);
}

// Set up the folder input for manual folder selection
function setupFolderInput() {
    const folderInput = document.getElementById('folder-input');
    folderInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            processFiles(files);
        }
    });
}

// Prevent default drag and drop behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Handle dropped items
async function handleDrop(e) {
    const items = e.dataTransfer.items;
    if (items.length > 0) {
        // Show processing indicator
        document.getElementById('processing-indicator').classList.remove('hidden');
        
        // Process the dropped items
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file' && item.webkitGetAsEntry) {
                const entry = item.webkitGetAsEntry();
                if (entry.isDirectory) {
                    await processDirectory(entry);
                }
            }
        }
        
        // Hide processing indicator
        document.getElementById('processing-indicator').classList.add('hidden');
    }
}

// Process files from input element
async function processFiles(files) {
    // Show processing indicator
    document.getElementById('processing-indicator').classList.remove('hidden');
    
    // Clear existing folder structure
    folderStructure = {};
    
    // Process all files
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = file.webkitRelativePath;
        
        // Only process MP3 files
        if (path.toLowerCase().endsWith('.mp3')) {
            const pathParts = path.split('/');
            
            // Skip files not in a subfolder
            if (pathParts.length < 2) continue;
            
            const folderName = pathParts[0];
            const fileName = pathParts[pathParts.length - 1];
            
            // Initialize folder if it doesn't exist
            if (!folderStructure[folderName]) {
                folderStructure[folderName] = [];
            }
            
            // Add file to folder
            folderStructure[folderName].push({
                name: fileName,
                file: file,
                path: path
            });
        }
    }
    
    // Display the folder structure
    displayFolders();
    
    // Hide processing indicator
    document.getElementById('processing-indicator').classList.add('hidden');
}

// Process a directory entry recursively
async function processDirectory(directoryEntry) {
    const folderName = directoryEntry.name;
    
    // Initialize folder if it doesn't exist
    if (!folderStructure[folderName]) {
        folderStructure[folderName] = [];
    }
    
    // Get all entries in the directory
    const entries = await readDirectoryEntries(directoryEntry);
    
    // Process each entry
    for (const entry of entries) {
        if (entry.isFile) {
            // Only process MP3 files
            if (entry.name.toLowerCase().endsWith('.mp3')) {
                const file = await getFileFromEntry(entry);
                
                // Add file to folder
                folderStructure[folderName].push({
                    name: entry.name,
                    file: file,
                    path: `${folderName}/${entry.name}`
                });
            }
        } else if (entry.isDirectory) {
            // Process subdirectory
            await processDirectory(entry);
        }
    }
    
    // Display the folder structure
    displayFolders();
}

// Read all entries in a directory
async function readDirectoryEntries(directoryEntry) {
    return new Promise((resolve, reject) => {
        const directoryReader = directoryEntry.createReader();
        const entries = [];
        
        // Function to read entries in batches
        function readEntries() {
            directoryReader.readEntries((results) => {
                if (results.length) {
                    entries.push(...results);
                    readEntries(); // Continue reading if there are more entries
                } else {
                    resolve(entries); // No more entries, resolve with all entries
                }
            }, reject);
        }
        
        readEntries();
    });
}

// Get a File object from a FileEntry
async function getFileFromEntry(fileEntry) {
    return new Promise((resolve, reject) => {
        fileEntry.file(resolve, reject);
    });
}

// Display the folder structure in the UI
function displayFolders() {
    const foldersContainer = document.getElementById('folders-container');
    
    // Clear existing content
    foldersContainer.innerHTML = '';
    
    // Check if there are any folders
    if (Object.keys(folderStructure).length === 0) {
        foldersContainer.innerHTML = '<p class="no-folders">No MP3 files found in the selected folders.</p>';
        return;
    }
    
    // Create a section for each folder
    for (const folderName in folderStructure) {
        const files = folderStructure[folderName];
        
        // Skip empty folders
        if (files.length === 0) continue;
        
        // Create folder section
        const folderSection = document.createElement('div');
        folderSection.className = 'folder-section';
        folderSection.id = `folder-${folderName}`;
        
        // Create folder header
        const folderHeader = document.createElement('div');
        folderHeader.className = 'folder-header';
        folderHeader.innerHTML = `
            <span>${folderName}</span>
            <button class="merge-button" data-folder="${folderName}">Merge MP3s</button>
        `;
        folderSection.appendChild(folderHeader);
        
        // Create folder content
        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content';
        
        // Create MP3 list
        const mp3List = document.createElement('ul');
        mp3List.className = 'mp3-list';
        mp3List.id = `mp3-list-${folderName}`;
        
        // Add MP3 items
        files.forEach((file, index) => {
            const mp3Item = document.createElement('li');
            mp3Item.className = 'mp3-item';
            mp3Item.dataset.index = index;
            mp3Item.innerHTML = `
                <span class="mp3-item-name">${file.name}</span>
                <span class="mp3-item-duration"></span>
            `;
            mp3List.appendChild(mp3Item);
            
            // Get audio duration (optional)
            getDuration(file.file).then(duration => {
                const durationElement = mp3Item.querySelector('.mp3-item-duration');
                durationElement.textContent = formatDuration(duration);
            }).catch(error => {
                console.error('Error getting duration:', error);
            });
        });
        
        folderContent.appendChild(mp3List);
        
        // Add progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = '<div class="progress-bar-fill"></div>';
        folderContent.appendChild(progressBar);
        
        folderSection.appendChild(folderContent);
        foldersContainer.appendChild(folderSection);
        
        // Initialize Sortable for this list
        initSortable(folderName);
    }
    
    // Add event listeners to merge buttons
    document.querySelectorAll('.merge-button').forEach(button => {
        button.addEventListener('click', () => {
            const folderName = button.dataset.folder;
            mergeMP3s(folderName);
        });
    });
}

// Initialize Sortable.js for a specific folder
function initSortable(folderName) {
    const mp3List = document.getElementById(`mp3-list-${folderName}`);
    
    Sortable.create(mp3List, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: function(evt) {
            // Update the folder structure after reordering
            updateFolderStructure(folderName, mp3List);
        }
    });
}

// Update the folder structure after reordering
function updateFolderStructure(folderName, mp3List) {
    const items = mp3List.querySelectorAll('.mp3-item');
    const newOrder = [];
    
    items.forEach(item => {
        const index = parseInt(item.dataset.index);
        newOrder.push(folderStructure[folderName][index]);
    });
    
    // Update the folder structure
    folderStructure[folderName] = newOrder;
    
    // Update the data-index attributes
    items.forEach((item, index) => {
        item.dataset.index = index;
    });
}

// Get the duration of an audio file
async function getDuration(file) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
        });
        audio.addEventListener('error', reject);
        audio.src = URL.createObjectURL(file);
    });
}

// Format duration in seconds to MM:SS format
function formatDuration(seconds) {
    if (isNaN(seconds)) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Merge MP3 files for a specific folder
async function mergeMP3s(folderName) {
    const files = folderStructure[folderName];
    
    if (files.length === 0) {
        showError('No MP3 files found in this folder.');
        return;
    }
    
    // 检查FFmpeg是否已初始化并加载
    if (!ffmpeg) {
        try {
            // 尝试重新初始化FFmpeg
            await initFFmpeg();
            if (!ffmpegLoaded) {
                showError('无法初始化FFmpeg，请刷新页面重试。');
                return;
            }
        } catch (error) {
            console.error('重新初始化FFmpeg失败:', error);
            showError('FFmpeg初始化失败，请刷新页面或使用其他浏览器。');
            return;
        }
    } else if (!ffmpegLoaded) {
        showError('FFmpeg尚未准备好，请等待几秒钟后再试。');
        return;
    }
    
    // Disable merge button
    const mergeButton = document.querySelector(`.merge-button[data-folder="${folderName}"]`);
    mergeButton.disabled = true;
    mergeButton.textContent = 'Merging...';
    
    // Show progress bar
    const progressBar = document.querySelector(`#folder-${folderName} .progress-bar`);
    progressBar.style.display = 'block';
    const progressBarFill = progressBar.querySelector('.progress-bar-fill');
    
    try {
        // Write each file to FFmpeg's virtual file system
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const data = await readFileAsArrayBuffer(file.file);
            ffmpeg.FS('writeFile', `input${i}.mp3`, new Uint8Array(data));
            
            // Update progress (50% of progress is for loading files)
            const progress = (i + 1) / files.length * 50;
            progressBarFill.style.width = `${progress}%`;
        }
        
        // Create a file list for FFmpeg
        const fileList = Array.from({ length: files.length }, (_, i) => `input${i}.mp3`).join('|');
        
        // Run FFmpeg to concatenate the files
        await ffmpeg.run('-i', `concat:${fileList}`, '-c', 'copy', 'output.mp3');
        
        // Update progress
        progressBarFill.style.width = '100%';
        
        // Read the output file
        const data = ffmpeg.FS('readFile', 'output.mp3');
        
        // Create a download link
        const blob = new Blob([data.buffer], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        
        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${folderName}.mp3`;
        a.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        
        // Clean up FFmpeg file system
        for (let i = 0; i < files.length; i++) {
            ffmpeg.FS('unlink', `input${i}.mp3`);
        }
        ffmpeg.FS('unlink', 'output.mp3');
        
        // Show success message
        showSuccess(`Successfully merged ${files.length} MP3 files into ${folderName}.mp3`);
    } catch (error) {
        console.error('Error merging MP3 files:', error);
        showError(`Failed to merge MP3 files: ${error.message}`);
    } finally {
        // Re-enable merge button
        mergeButton.disabled = false;
        mergeButton.textContent = 'Merge MP3s';
        
        // Hide progress bar after a delay
        setTimeout(() => {
            progressBar.style.display = 'none';
            progressBarFill.style.width = '0%';
        }, 2000);
    }
}

// Read a file as ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Show an error message
function showError(message) {
    const foldersContainer = document.getElementById('folders-container');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    foldersContainer.insertBefore(errorElement, foldersContainer.firstChild);
    
    // Remove the error message after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Show a success message
function showSuccess(message) {
    const foldersContainer = document.getElementById('folders-container');
    
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    
    foldersContainer.insertBefore(successElement, foldersContainer.firstChild);
    
    // Remove the success message after 5 seconds
    setTimeout(() => {
        successElement.remove();
    }, 5000);
}