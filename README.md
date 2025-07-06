# DISCLAIMER: NOT FULLY WORKING THATS WHY IM OPEN SOURCING IT

# Nexus Chat

A modern, real-time chat application with Discord-inspired UI, built with Node.js, Express.js, and Socket.IO. Features a beautiful dark purple theme and seamless file sharing capabilities.

## ✨ Features

- **🎨 Discord-inspired UI** - Familiar sidebar layout with modern dark purple theme
- **💬 Real-time messaging** - Instant message delivery using Socket.IO
- **📎 File sharing** - Upload and share images, documents, and other files (up to 10MB)
- **👥 Online users list** - See who's currently online in the sidebar
- **⌨️ Typing indicators** - See when other users are typing
- **🔔 User presence** - Live notifications when users join/leave
- **📱 Responsive design** - Works perfectly on desktop and mobile devices
- **🌐 Vercel-ready** - Configured for easy deployment with Cloudinary integration
- **🗄️ No database required** - Uses in-memory storage for simplicity
- **🔄 Auto-reconnection** - Automatically reconnects if connection is lost
- **🔒 XSS protection** - Secure message handling with HTML escaping
- **Modern UI** - Beautiful gradient design with smooth animations
- **Responsive design** - Works perfectly on mobile and desktop
- **No database required** - Uses in-memory storage for simplicity
- **Easy deployment** - Ready for Vercel deployment

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 🌐 Deployment

### Quick Deploy to Vercel

1. **Deploy to Vercel:**
   ```bash
   vercel
   ```

2. **For file uploads** (optional): Set up Cloudinary
   - Create free account at https://cloudinary.com
   - Add environment variables in Vercel dashboard:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`

> **Note**: The app works perfectly without file uploads! Cloudinary is only needed if you want file sharing on production.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Deploy to Other Platforms

The app works on any platform that supports Node.js:
- Heroku
- Railway
- Render
- DigitalOcean App Platform

## 📁 Project Structure

```
simple-chat-app/
├── public/
│   ├── index.html      # Main HTML file
│   ├── style.css       # Styles and animations
│   └── script.js       # Client-side JavaScript
├── index.js            # Server-side code
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel deployment config
└── README.md           # You are here!
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Real-time**: WebSocket connections via Socket.IO
- **Deployment**: Vercel serverless functions

## 🎯 How It Works

1. **User Authentication**: Simple username-based join system
2. **Real-time Communication**: Socket.IO handles bidirectional communication
3. **Message Broadcasting**: Messages are broadcast to all connected clients
4. **State Management**: User presence and typing states are tracked server-side
5. **UI Updates**: DOM manipulation for real-time UI updates

## 🔧 Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)

### Socket.IO Configuration

The app includes CORS configuration for cross-origin requests and automatic reconnection handling.

## 🎨 Customization

### Styling

Edit `public/style.css` to customize:
- Color schemes (gradient backgrounds)
- Typography and fonts
- Spacing and layout
- Mobile responsiveness

### Features

Add new features by modifying:
- `index.js` - Server-side logic
- `public/script.js` - Client-side functionality
- `public/index.html` - UI structure

## 📱 Mobile Support

The app is fully responsive and works great on:
- iOS Safari
- Android Chrome
- Mobile browsers with WebSocket support

## 🔒 Security Features

- HTML escaping to prevent XSS attacks
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- Rate limiting ready (can be easily added)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT environment variable
2. **Connection issues**: Check firewall settings
3. **Deployment problems**: Ensure all files are committed to git

### Support

If you encounter any issues, please check:
- Node.js version compatibility
- Network connectivity
- Browser WebSocket support

## 🎉 What's Next?

Potential enhancements:
- User authentication with accounts
- Private messaging
- File/image sharing
- Message persistence with database
- Push notifications
- Multiple chat rooms
- Admin controls

---

Made with ❤️ using Node.js and Socket.IO
