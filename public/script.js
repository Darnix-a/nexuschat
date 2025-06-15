// DOM elements
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');
const currentUserSpan = document.getElementById('currentUser');
const userCountSpan = document.getElementById('userCount');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const usersList = document.getElementById('usersList');

// Socket connection
const socket = io();

// Current user state
let currentUsername = '';
let isTyping = false;
let typingTimeout;

// Event listeners
joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinChat();
    }
});

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

messageInput.addEventListener('input', handleTyping);

// File upload event listener
fileInput.addEventListener('change', handleFileUpload);

// Functions
function joinChat() {
    const username = usernameInput.value.trim();
    if (username && username.length >= 2) {
        currentUsername = username;
        currentUserSpan.textContent = username;
        
        // Hide login screen and show chat screen
        loginScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
        
        // Focus on message input
        messageInput.focus();
        
        // Emit join event
        socket.emit('join', username);
        
        // Add welcome message
        addSystemMessage(`Welcome to the chat, ${username}!`);
    } else {
        alert('Please enter a username with at least 2 characters');
    }
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat message', { message: message });
        messageInput.value = '';
        
        // Stop typing indicator
        if (isTyping) {
            isTyping = false;
            socket.emit('typing', { isTyping: false });
        }
    }
}

function handleTyping() {
    if (!isTyping) {
        isTyping = true;
        socket.emit('typing', { isTyping: true });
    }
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        isTyping = false;
        socket.emit('typing', { isTyping: false });
    }, 1000);
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Show upload progress
    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    
    try {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
                progressText.textContent = Math.round(percentComplete) + '%';
            }
        });
        
        xhr.addEventListener('load', () => {
            uploadProgress.style.display = 'none';
            
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                
                // Send file message via socket
                socket.emit('file message', {
                    message: `Shared a file: ${response.originalname}`,
                    file: {
                        filename: response.filename,
                        originalname: response.originalname,
                        size: response.size,
                        url: response.url
                    }
                });
                
                // Clear file input
                fileInput.value = '';
            } else {
                alert('File upload failed. Please try again.');
            }
        });
        
        xhr.addEventListener('error', () => {
            uploadProgress.style.display = 'none';
            alert('File upload failed. Please try again.');
        });
        
        xhr.open('POST', '/upload');
        xhr.send(formData);
        
    } catch (error) {
        uploadProgress.style.display = 'none';
        alert('File upload failed. Please try again.');
        console.error('Upload error:', error);
    }
}

function addMessage(data, isOwn = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const time = new Date(data.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    let messageContent = '';
    
    if (data.type === 'file' && data.file) {
        const file = data.file;
        const isImage = file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        
        if (isImage) {
            messageContent = `
                <div class="message-text">${escapeHtml(data.message)}</div>
                <img src="${file.url}" alt="${escapeHtml(file.originalname)}" class="image-preview" onclick="openImagePreview('${file.url}')">
            `;
        } else {
            const fileIcon = getFileIcon(file.originalname);
            messageContent = `
                <div class="message-text">${escapeHtml(data.message)}</div>
                <div class="file-message">
                    <div class="file-icon">${fileIcon}</div>
                    <div class="file-info">
                        <div class="file-name">${escapeHtml(file.originalname)}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                    <button class="file-download" onclick="downloadFile('${file.url}', '${escapeHtml(file.originalname)}')">
                        Download
                    </button>
                </div>
            `;
        }
    } else {
        messageContent = `<div class="message-text">${escapeHtml(data.message)}</div>`;
    }
    
    messageDiv.innerHTML = `
        <div class="user-avatar">👤</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-username">${data.username}</span>
                <span class="message-time">${time}</span>
            </div>
            ${messageContent}
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    scrollToBottom();
}

function addSystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.innerHTML = `<div class="system-message-text">${message}</div>`;
    messagesDiv.appendChild(messageDiv);
    scrollToBottom();
}

function updateTypingIndicator(users) {
    if (users.length === 0) {
        typingIndicator.textContent = '';
    } else if (users.length === 1) {
        typingIndicator.textContent = `${users[0]} is typing...`;
    } else if (users.length === 2) {
        typingIndicator.textContent = `${users[0]} and ${users[1]} are typing...`;
    } else {
        typingIndicator.textContent = `${users[0]} and ${users.length - 1} others are typing...`;
    }
}

function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    switch (extension) {
        case 'pdf': return '📄';
        case 'doc':
        case 'docx': return '📝';
        case 'xls':
        case 'xlsx': return '📊';
        case 'zip':
        case 'rar': return '🗜️';
        case 'mp4':
        case 'avi':
        case 'mov': return '🎥';
        case 'mp3':
        case 'wav':
        case 'flac': return '🎵';
        case 'txt': return '📄';
        default: return '📎';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function openImagePreview(url) {
    window.open(url, '_blank');
}

function updateUsersList(users) {
    if (!usersList) return;
    
    usersList.innerHTML = '';
    users.forEach(username => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-avatar">👤</div>
            <div class="username">${escapeHtml(username)}</div>
        `;
        usersList.appendChild(userItem);
    });
}

// Socket event listeners
socket.on('chat message', (data) => {
    const isOwn = data.username === currentUsername;
    addMessage(data, isOwn);
});

socket.on('user joined', (data) => {
    addSystemMessage(data.message);
});

socket.on('user left', (data) => {
    addSystemMessage(data.message);
});

socket.on('user count', (count) => {
    const text = count === 1 ? '1 member' : `${count} members`;
    userCountSpan.textContent = text;
});

socket.on('user list', (users) => {
    updateUsersList(users);
});

// Typing indicator management
const typingUsers = new Set();

socket.on('typing', (data) => {
    if (data.isTyping) {
        typingUsers.add(data.username);
    } else {
        typingUsers.delete(data.username);
    }
    
    updateTypingIndicator(Array.from(typingUsers));
});

// Handle connection events
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    addSystemMessage('Disconnected from server. Trying to reconnect...');
});

socket.on('reconnect', () => {
    console.log('Reconnected to server');
    addSystemMessage('Reconnected to server!');
    
    // Rejoin if we were already in the chat
    if (currentUsername) {
        socket.emit('join', currentUsername);
    }
});

// Focus on username input when page loads
window.addEventListener('load', () => {
    usernameInput.focus();
});
