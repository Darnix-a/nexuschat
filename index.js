const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configure Cloudinary (for Vercel deployment)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// Create uploads directory if it doesn't exist (for local development)
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads (memory storage for Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and other common file types
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|txt|docx|doc|xlsx|xls|zip|rar|mp4|avi|mov|mp3|wav|flac/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /^(image\/|application\/pdf|text\/|application\/vnd\.|application\/zip|application\/x-rar|video\/|audio\/)/.test(file.mimetype);
    
    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// File upload endpoint
app.post('/upload', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        error: err.message || 'File upload failed' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    try {
      // Use Cloudinary if configured, otherwise save locally
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'demo') {
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              public_id: `chat_files/${Date.now()}_${req.file.originalname}`,
              original_filename: req.file.originalname
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.file.buffer);
        });
        
        console.log('File uploaded to Cloudinary:', result.public_id);
        
        return res.json({
          filename: result.public_id,
          originalname: req.file.originalname,
          size: req.file.size,
          url: result.secure_url,
          mimetype: req.file.mimetype
        });
      } else {
        // Fallback to local storage for development
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = uniqueSuffix + path.extname(req.file.originalname);
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, req.file.buffer);
        
        console.log('File uploaded locally:', fileName);
        
        return res.json({
          filename: fileName,
          originalname: req.file.originalname,
          size: req.file.size,
          url: `/uploads/${fileName}`,
          mimetype: req.file.mimetype
        });
      }
    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      return res.status(500).json({ 
        error: 'Failed to upload file' 
      });
    }
  });
});

// Store connected users
const users = new Map();

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  // Handle user joining
  socket.on('join', (username) => {
    users.set(socket.id, username);
    socket.broadcast.emit('user joined', {
      username: username,
      message: `${username} joined the chat`
    });
    
    // Send current user count and user list
    const userList = Array.from(users.values());
    io.emit('user count', users.size);
    io.emit('users list', userList);
  });
  // Handle chat messages
  socket.on('chat message', (data) => {
    const username = users.get(socket.id);
    if (username) {
      io.emit('chat message', {
        username: username,
        message: data.message,
        timestamp: new Date().toISOString(),
        type: data.type || 'text'
      });
    }
  });

  // Handle file sharing
  socket.on('file message', (data) => {
    const username = users.get(socket.id);
    if (username) {
      io.emit('chat message', {
        username: username,
        message: data.message,
        timestamp: new Date().toISOString(),
        type: 'file',
        file: data.file
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const username = users.get(socket.id);
    if (username) {
      socket.broadcast.emit('typing', {
        username: username,
        isTyping: data.isTyping
      });
    }
  });
  // Handle disconnect
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      socket.broadcast.emit('user left', {
        username: username,
        message: `${username} left the chat`
      });
      
      // Send updated user count and user list
      const userList = Array.from(users.values());
      io.emit('user count', users.size);
      io.emit('users list', userList);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
