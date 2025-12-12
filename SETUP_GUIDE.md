# Complete Setup Guide - Chat App

This guide will walk you through setting up both the frontend and backend for the chat application.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Set Up MongoDB

**Option A: Local MongoDB**
1. Install MongoDB locally or use Docker
2. Start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string (replace `<password>` with your password)
4. Whitelist your IP address

### Step 3: Create Environment File

Create a `.env` file in the `backend` folder:

```env
PORT=3000
NODE_ENV=development

# MongoDB Configuration
# For local: mongodb://localhost:27017/chat-app
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/chat-app
MONGODB_URI=mongodb://localhost:27017/chat-app

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
```

**Important:** 
- Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong, random strings (at least 32 characters)
- Update `MONGODB_URI` with your actual MongoDB connection string
- If your frontend runs on a different port, update `CORS_ORIGIN` and `SOCKET_CORS_ORIGIN`

### Step 4: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on port 3000
📡 Socket.IO server initialized
🌍 Environment: development
```

### Step 5: Test Backend

Open your browser and visit:
- `http://localhost:3000/api/health` - Should return a success message

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd chat-app
npm install
```

### Step 2: Create Environment File (Optional)

Create a `.env` file in the `chat-app` folder if you need to customize URLs:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

**Note:** The frontend already has default values, so this step is optional unless your backend runs on a different port.

### Step 3: Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 4: Access the Application

Open your browser and go to:
- `http://localhost:5173`

---

## Testing the Application

### 1. Test Registration

1. Go to the registration page
2. Fill in:
   - Username
   - Email
   - Password (min 8 chars, with uppercase, lowercase, and number)
   - Confirm Password
3. Click "Register"
4. You should be redirected to the chat page

### 2. Test Login

1. If you're logged out, go to login page
2. Enter your email and password
3. Click "Login"
4. You should be redirected to the chat page

### 3. Test Real-time Chat

**In two different browsers/incognito windows:**

1. **Window 1:** Login as User 1
2. **Window 2:** Login as User 2
3. **Window 1:** Create a new chat with User 2
4. **Window 2:** Accept/see the chat
5. Send messages between the two windows
6. Messages should appear in real-time!

---

## Common Issues & Solutions

### Backend Issues

**Issue: MongoDB connection error**
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For Atlas, verify your IP is whitelisted

**Issue: Port already in use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:**
- Change `PORT` in `.env` to a different port (e.g., 3001)
- Or stop the process using port 3000

**Issue: JWT secret error**
```
Error: secret or private key must have a value
```
**Solution:**
- Make sure `.env` file exists and has `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Restart the server after creating/updating `.env`

### Frontend Issues

**Issue: Cannot connect to backend**
```
❌ Request Error: Network Error
```
**Solution:**
- Make sure backend is running on port 3000
- Check `VITE_API_BASE_URL` in frontend `.env` (if created)
- Check browser console for CORS errors
- Verify backend CORS settings allow your frontend origin

**Issue: Socket connection failed**
```
❌ Socket connection error
```
**Solution:**
- Make sure backend Socket.IO server is running
- Check `VITE_SOCKET_URL` in frontend `.env`
- Verify backend `SOCKET_CORS_ORIGIN` matches frontend URL

**Issue: Authentication not working**
```
401 Unauthorized
```
**Solution:**
- Check if token is being stored in localStorage
- Verify JWT_SECRET matches between frontend expectations and backend
- Clear browser localStorage and try logging in again

---

## Development Workflow

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd chat-app
npm run dev
```

### Making Changes

- **Backend changes:** Server will auto-reload with nodemon
- **Frontend changes:** Vite will hot-reload automatically
- **Database changes:** You may need to restart backend if models change significantly

---

## Production Deployment Checklist

### Backend:
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong, unique JWT secrets
- [ ] Set up proper MongoDB connection (Atlas recommended)
- [ ] Configure CORS for production domain
- [ ] Set up environment variables on hosting platform
- [ ] Enable HTTPS
- [ ] Set up error logging/monitoring

### Frontend:
- [ ] Update API URLs to production backend
- [ ] Build production bundle: `npm run build`
- [ ] Test production build locally: `npm run preview`
- [ ] Deploy to hosting (Vercel, Netlify, etc.)
- [ ] Update environment variables on hosting platform

---

## API Testing

You can test the API using:

1. **Browser:** Visit `http://localhost:3000/api/health`
2. **Postman/Insomnia:** Import the endpoints
3. **curl:**
   ```bash
   # Health check
   curl http://localhost:3000/api/health
   
   # Register (example)
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"Test1234"}'
   ```

---

## Next Features to Implement

1. **File Uploads:** Add image/file sharing
2. **User Profiles:** Profile pictures, status messages
3. **Group Chats:** Create and manage group conversations
4. **Message Reactions:** Emoji reactions to messages
5. **Search:** Search messages and chats
6. **Notifications:** Browser/push notifications
7. **Message Status:** Delivered, read receipts
8. **Typing Indicators:** Show when users are typing
9. **Online Status:** Real-time online/offline indicators
10. **Message Editing:** Edit sent messages

---

## Support

If you encounter issues:
1. Check the console/terminal for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that ports 3000 (backend) and 5173 (frontend) are available
5. Review the error messages in browser console and server logs

Good luck with your chat application! 🚀



