# Chat App Backend

Backend server for real-time chat application built with Node.js, Express, Socket.IO, and MongoDB.

## Features

- 🔐 User authentication (JWT)
- 💬 Real-time messaging with Socket.IO
- 👥 Private and group chats
- 📱 RESTful API
- 🔒 Protected routes
- ✅ Error handling
- 📊 MongoDB database

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- MongoDB connection string
- JWT secrets
- Port number
- CORS origins

4. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration time
- `JWT_REFRESH_SECRET` - Refresh token secret
- `JWT_REFRESH_EXPIRE` - Refresh token expiration
- `CORS_ORIGIN` - Allowed CORS origin
- `SOCKET_CORS_ORIGIN` - Socket.IO CORS origin

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/refresh` - Refresh access token

### Chats
- `GET /api/chats` - Get all chats
- `GET /api/chats/:id` - Get chat by ID
- `POST /api/chats` - Create new chat
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat
- `GET /api/chats/search?q=query` - Search chats

### Messages
- `GET /api/chats/:chatId/messages` - Get messages
- `POST /api/chats/:chatId/messages` - Send message
- `PUT /api/chats/:chatId/messages/:messageId` - Update message
- `DELETE /api/chats/:chatId/messages/:messageId` - Delete message
- `POST /api/chats/:chatId/messages/read` - Mark as read

## Socket.IO Events

### Client to Server
- `join` - Join a chat room
- `leave` - Leave a chat room
- `message` - Send a message
- `userTyping` - User is typing
- `userStoppedTyping` - User stopped typing

### Server to Client
- `message` - New message received
- `userJoined` - User joined chat
- `userLeft` - User left chat
- `userTyping` - User typing indicator
- `userStoppedTyping` - User stopped typing indicator
- `error` - Error occurred

## Project Structure

```
backend/
├── controllers/     # Route controllers
├── middlewares/     # Custom middlewares
├── models/          # MongoDB models
├── routes/          # API routes
├── socket/          # Socket.IO handlers
├── config/          # Configuration files
├── utils/           # Utility functions
├── uploads/         # File uploads
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Technologies

- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing



