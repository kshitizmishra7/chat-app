# Quick Start Checklist

## ✅ Backend Setup (Do First)

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up MongoDB
- **Option A:** Install MongoDB locally and start the service
- **Option B:** Use MongoDB Atlas (free cloud database)
  - Sign up at https://www.mongodb.com/cloud/atlas
  - Create a cluster
  - Get connection string

### 4. Create `.env` file in `backend/` folder
```env
PORT=3000
NODE_ENV=development
# Your MongoDB connection string (add database name at the end)
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=change-this-to-a-random-32-character-string
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=change-this-to-another-random-32-character-string
JWT_REFRESH_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
```

**Note:** Your MongoDB connection string is `mongodb://localhost:27017/` - add the database name to make it `mongodb://localhost:27017/chat-app`

### 5. Start backend server
```bash
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected: localhost
🚀 Server running on port 3000
📡 Socket.IO server initialized
```

---

## ✅ Frontend Setup (Do Second)

### 1. Navigate to frontend folder (in a new terminal)
```bash
cd chat-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. (Optional) Create `.env` file in `chat-app/` folder
Only needed if backend runs on different port:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 4. Start frontend server
```bash
npm run dev
```

**Expected output:**
```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 5. Open browser
Go to: `http://localhost:5173`

---

## 🧪 Test Everything

1. **Register a new user**
   - Go to registration page
   - Create an account
   - Should redirect to chat page

2. **Test in two browsers**
   - Open incognito window
   - Register/login as second user
   - Create a chat between users
   - Send messages - they should appear in real-time!

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Make sure MongoDB is running |
| Port 3000 already in use | Change PORT in backend `.env` |
| CORS errors | Check CORS_ORIGIN matches frontend URL |
| Socket connection failed | Verify backend is running and SOCKET_CORS_ORIGIN is correct |
| 401 Unauthorized | Clear localStorage and login again |

---

## 📝 What to Do Next

1. ✅ Get both servers running
2. ✅ Test registration and login
3. ✅ Test real-time messaging
4. 🎨 Customize the UI
5. 🚀 Add more features (file uploads, group chats, etc.)

For detailed instructions, see `SETUP_GUIDE.md`

