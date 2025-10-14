# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pokemon Crypto Portfolio Tracker - A gamified cryptocurrency portfolio tracking application where investment levels are represented by Pokemon images based on portfolio value. Pokemon progression is determined by weight (lightest to heaviest) as portfolio grows from $100 baseline with 1.5x multiplier per level.

**Tech Stack:** React + Vite frontend, Node.js + Express backend, Firebase Firestore database, Firebase Authentication

**Live Deployment:**
- Frontend: https://mikecinchan.github.io/pokemon-portfolio/
- Backend: https://pokemon-portfolio-backend.onrender.com

---

## Development Commands

### Backend (from `backend/` directory)
```bash
npm install              # Install dependencies
npm run dev              # Start development server (nodemon on port 5000)
npm start                # Production server
```

### Frontend (from `frontend/` directory)
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (Vite on port 5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run deploy           # Deploy to GitHub Pages (builds + pushes to gh-pages branch)
```

### Running Both Servers
Open two terminal windows and run:
- Terminal 1: `cd backend && npm run dev`
- Terminal 2: `cd frontend && npm run dev`

Backend must be running before frontend can fetch data.

---

## Critical Architecture Patterns

### Firebase Dual-SDK Architecture

**IMPORTANT:** This project uses DIFFERENT Firebase SDKs in frontend vs backend:

**Frontend:** Uses client-side Firebase SDK (`firebase` package)
- Imports: `firebase/app`, `firebase/auth`, `firebase/firestore`
- Authentication: User signs in with Firebase Auth
- Database access: Subject to Firestore security rules
- Configuration: Via environment variables (VITE_FIREBASE_*)

**Backend:** Uses Firebase Admin SDK (`firebase-admin` package)
- Imports: `firebase-admin` only
- Authentication: Service account credentials (`backend/serviceAccountKey.json`)
- Database access: **Bypasses** Firestore security rules (admin privileges)
- Configuration: Service account JSON file + FIREBASE_PROJECT_ID env var

**Never mix these SDKs:** Do not import `firebase/app` in backend or `firebase-admin` in frontend.

### Backend Service Account Authentication

The backend requires `backend/serviceAccountKey.json` (in `.gitignore`) to authenticate:

1. File location: `backend/serviceAccountKey.json`
2. Loaded in: `backend/services/firebase.js`
3. Initialization pattern:
```javascript
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
});
const db = admin.firestore();
```

**Setup for new developers:** Download from Firebase Console → Project Settings → Service Accounts → Generate new private key.

### Firestore Queries Require Indexes

**Critical:** All queries with `where()` + `orderBy()` on different fields require composite indexes.

Current required index:
- Collection: `investments`
- Fields: `userId` (Ascending) + `createdAt` (Descending)

When adding new queries, Firebase will return error with auto-generated index creation link. Click link to create index (takes 1-2 minutes to build).

### Context-Based State Management

Frontend uses React Context API (not Redux):

**AuthContext** (`frontend/src/context/AuthContext.jsx`):
- Wraps entire app
- Provides: `currentUser`, `login()`, `signup()`, `logout()`
- Manages Firebase Authentication state

**PortfolioContext** (`frontend/src/context/PortfolioContext.jsx`):
- Wraps Dashboard (requires authentication)
- Provides: `investments`, `addInvestment()`, `updateInvestment()`, `deleteInvestment()`, `refreshPrices()`
- Handles all backend API calls via `frontend/src/services/api.js`

All investment CRUD operations flow through PortfolioContext, not directly from components.

### Pokemon Level Calculation Algorithm

Core logic (1.5x exponential growth):
```javascript
function calculateLevel(totalValue) {
  if (totalValue < 100) return 0;
  let level = 0;
  let threshold = 100;
  while (totalValue >= threshold) {
    level++;
    threshold = threshold * 1.5;
  }
  return level;
}
```

Pokemon selection:
1. Fetch all Pokemon from PokeAPI sorted by weight (ascending)
2. Map level number directly to Pokemon array index
3. Cache Pokemon data to avoid repeated API calls

### Authentication Flow

**Backend middleware** (`backend/middleware/authMiddleware.js`):
- Expects `Authorization: Bearer <token>` header
- Expects `x-user-id` header with Firebase UID
- Adds `req.userId` for controllers to use
- Does NOT verify token (trusts client + relies on Firestore security rules)

**Frontend auth service** (`frontend/src/services/auth.js`):
- Uses Firebase Auth for login/signup
- Stores user in AuthContext
- Automatically attaches headers to API requests

### API Response Caching

**Dexscreener price caching** (`backend/services/dexscreener.js`):
- Caches token prices for 30 seconds in memory
- Reduces API calls during portfolio refresh
- Cache key format: `PRICE_CACHE_${ticker.toUpperCase()}`

**Pokemon caching** (`backend/controllers/pokemonController.js`):
- Caches sorted Pokemon array in memory
- Refreshes on server restart or manual cache clear

---

## Common Development Tasks

### Adding a New Investment Field

1. Update Firestore document structure in `backend/controllers/investmentController.js` (createInvestment, updateInvestment)
2. Update frontend form in `frontend/src/components/Dashboard.jsx` (InvestmentForm section)
3. Update investment display in `frontend/src/components/Dashboard.jsx` (InvestmentList section)
4. Consider if new field requires Firestore index (if used in queries)

### Adding a New API Endpoint

1. Create controller function in `backend/controllers/`
2. Add route in `backend/routes/`
3. Import and mount route in `backend/server.js`
4. Add corresponding function in `frontend/src/services/api.js`
5. Use via PortfolioContext or create new context if needed

### Modifying Pokemon Level Logic

Primary location: Pokemon emblem display logic is in `frontend/src/components/Dashboard.jsx`
- Level calculation happens in PortfolioContext when total value changes
- Pokemon fetch happens in Dashboard useEffect when level changes
- Modify thresholds or multiplier in level calculation function

### Handling External API Changes

**Dexscreener API** (`backend/services/dexscreener.js`):
- Search endpoint: Returns array of matching tokens
- Extracts first match with valid USD price
- Fallback: Returns cached price if API fails
- Error handling: Throws descriptive error for invalid tickers

**PokeAPI** (`backend/controllers/pokemonController.js`):
- Fetches all Pokemon (limit=1000)
- Fetches individual Pokemon data for weight
- No rate limiting, but implementation includes error handling

---

## Firebase Configuration

### Required Firestore Indexes

1. **investments collection:**
   - userId (Ascending) + createdAt (Descending)

Create via Firebase Console or click auto-generated link in error message.

### Security Rules Location

Rules documented in `FIREBASE_SECURITY_RULES.md`.

Current rules require:
- User authentication (`request.auth != null`)
- userId ownership match (`request.auth.uid == resource.data.userId`)

Backend bypasses these with admin credentials.

### Environment Variables

**Backend `.env`:**
```
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**Frontend `.env.production`** (for GitHub Pages):
```
VITE_API_URL=https://pokemon-portfolio-backend.onrender.com/api
[same Firebase config as dev]
```

Templates available in `.env.example` files.

---

## Troubleshooting Reference

### "Permission Denied" errors
**Symptom:** 403 errors, "Missing or insufficient permissions"
**Cause:** Service account key missing or not loaded
**Fix:** Ensure `backend/serviceAccountKey.json` exists and is loaded in firebase.js
**Verify:** Backend startup should log "✅ Firebase Admin initialized with service account credentials"

### "The query requires an index" errors
**Symptom:** 500 errors on GET requests, "FAILED_PRECONDITION" in logs
**Cause:** Firestore composite index not created
**Fix:** Click index creation URL in error message, wait 1-2 minutes for build
**Verify:** Check Firebase Console → Firestore → Indexes tab

### "Cannot find module 'firebase/app'" in backend
**Symptom:** Backend crashes on startup with module not found
**Cause:** Importing client SDK in backend code
**Fix:** Use `firebase-admin` instead, import with `const admin = require('firebase-admin')`

### Investments created but not displaying
**Symptom:** POST succeeds, GET returns empty array or 500
**Likely causes:**
1. Missing Firestore index (most common)
2. userId mismatch between created investment and query
3. Backend not using admin credentials
**Debug:** Check backend logs for exact error, verify userId matches in Firebase Console

### Frontend can't connect to backend
**Symptom:** "Network Error" in console, all API calls fail
**Check:**
1. Backend server running: `curl http://localhost:5000/health`
2. `VITE_API_URL` in frontend `.env` points to correct backend URL
3. No CORS errors (CORS is enabled in backend)

Comprehensive troubleshooting guide available in `error-handling.md`.

---

## Code Organization Principles

### Backend Route → Controller → Service Pattern

```
Request → Route → Controller → Service → External API/Database
         ↓        ↓           ↓
      routes/  controllers/ services/
```

- **Routes** (`backend/routes/`): Define endpoints, attach middleware, minimal logic
- **Controllers** (`backend/controllers/`): Handle request/response, validation, error handling
- **Services** (`backend/services/`): Reusable business logic, external API calls, database operations

### Frontend Component Hierarchy

```
App.jsx
├── AuthProvider (context)
│   └── AppContent
│       └── PortfolioProvider (context, requires auth)
│           └── Dashboard.jsx
│               ├── Pokemon Emblem Display
│               ├── Portfolio Summary
│               ├── Investment Form
│               └── Investment List
```

State flows down through context, actions bubble up through context methods.

### Service Layer Responsibilities

**Backend services:**
- `firebase.js`: Admin SDK initialization (singleton pattern)
- `dexscreener.js`: Token price fetching + caching
- `pokeapi.js`: Pokemon data fetching

**Frontend services:**
- `auth.js`: Firebase Auth operations (login, signup, logout)
- `api.js`: Backend API wrapper (axios instance with auth headers)
- `firebase.js`: Client Firebase SDK initialization

All external API calls must go through service layer, never directly from controllers/components.

---

## Deployment Notes

### GitHub Pages Deployment

Frontend configured for GitHub Pages with base path `/pokemon-portfolio/`:
- Set in `frontend/vite.config.js` (`base` property)
- Deploy command: `npm run deploy` (builds + pushes to `gh-pages` branch)
- Must enable GitHub Pages in repo settings (Source: gh-pages branch)

### Render Backend Deployment

Backend hosted on Render (free tier):
- Environment variables set in Render dashboard
- Service account uploaded as secret file: `serviceAccountKey.json`
- Auto-deploys on push to main branch
- Start command: `npm start`

### Production Environment Differences

Frontend production build:
- Uses `.env.production` instead of `.env`
- `VITE_API_URL` points to Render backend
- Build output in `dist/` directory

Backend production:
- `NODE_ENV=production` disables request logging
- Uses same Firebase credentials as development
- CORS configured to allow all origins (should restrict in production)

---

## Key Files Reference

**Critical configuration files:**
- `backend/services/firebase.js` - Admin SDK initialization
- `backend/middleware/authMiddleware.js` - Auth verification
- `frontend/src/context/AuthContext.jsx` - User auth state
- `frontend/src/context/PortfolioContext.jsx` - Investment state
- `frontend/vite.config.js` - GitHub Pages base path

**Entry points:**
- `backend/server.js` - Express server
- `frontend/src/App.jsx` - React root component

**API integration:**
- `backend/services/dexscreener.js` - Crypto prices
- `backend/controllers/pokemonController.js` - Pokemon data

**Documentation:**
- `README.md` - Setup guide
- `QUICKSTART.md` - Fast setup (5 minutes)
- `error-handling.md` - Comprehensive troubleshooting
- `DEPLOYMENT.md` - Production deployment guide
- `FIREBASE_SECURITY_RULES.md` - Security rules documentation
- `specification Plan.md` - Detailed technical specifications

---

## Testing Approach

**No formal test suite currently implemented.**

Manual testing checklist in `specification Plan.md` includes:
- Investment CRUD operations
- Portfolio calculations
- Pokemon level progression
- API integrations
- Responsive design

When adding tests in future:
- Backend: Use Jest or Mocha, test controllers and services separately
- Frontend: Use Vitest (included with Vite), React Testing Library
- Integration: Test Firebase operations with emulator

---

## Performance Considerations

**Price caching:** Dexscreener prices cached for 30 seconds to reduce API calls during portfolio refresh (every 30s on frontend).

**Pokemon caching:** Full Pokemon list cached in memory on backend startup. Consider moving to database for better persistence.

**Firestore queries:** Use composite indexes to keep queries fast. Consider pagination if portfolio exceeds 50+ investments.

**Bundle size:** Frontend bundle is 523KB (warning threshold 500KB). Consider code-splitting if adding more features.

---

## Security Notes

**Service account file:** `backend/serviceAccountKey.json` is in `.gitignore`. Never commit this file.

**Environment files:** `.env` files are in `.gitignore`. Use `.env.example` templates for new developers.

**Backend authentication:** Current implementation trusts client-provided `x-user-id` header. Security enforcement relies on Firestore rules. Consider token verification for stricter security.

**CORS:** Backend allows all origins. Restrict to frontend domain in production:
```javascript
app.use(cors({
  origin: 'https://mikecinchan.github.io'
}));
```
