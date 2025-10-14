# Quick Start Guide

## Prerequisites
- Node.js v18+ installed
- Firebase account created

## 5-Minute Setup

### 1. Firebase Setup (2 minutes)
1. Go to https://console.firebase.google.com/
2. Create new project → Enable Firestore
3. Get credentials:
   - Project Settings → General → Your apps → Web app (</>) icon
   - Copy the firebaseConfig (used for both frontend and backend!)

### 2. Backend Setup (1 minute)
```bash
cd backend
cp .env.example .env
# Edit .env with Firebase credentials
npm install
npm run dev
```

### 3. Frontend Setup (1 minute)
```bash
cd frontend
cp .env.example .env
# Edit .env with Firebase web config
npm install
npm run dev
```

### 4. Access Application (1 minute)
- Open http://localhost:5173
- Add your first investment!
- Watch your Pokemon appear at $100!

## Environment Variables Quick Reference

### Backend `.env` (same Firebase config as frontend)
```env
PORT=5000
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

**Note:** Both frontend and backend use the same Firebase web configuration!

## Common Issues

❌ **"Cannot connect to backend"**
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend .env

❌ **"Token not found"**
- Token might not be on Dexscreener
- Try popular tokens: BTC, ETH, SOL

❌ **Firebase errors**
- Double-check credentials in .env files
- Ensure Firestore is enabled in Firebase console

## Testing the App

1. Add investment: BTC, amount: 0.001
2. See Pokemon appear when portfolio reaches $100
3. Edit/delete investments
4. Watch portfolio value update automatically

## Next Steps

- Read full [README.md](./README.md)
- Check [specification Plan.md](./specification%20Plan.md) for details
- Customize Pokemon level thresholds
- Add authentication for multi-user support

Happy tracking! 🎮💰
