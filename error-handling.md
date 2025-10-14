# Error Handling & Resolution Guide

## Pokemon Portfolio Tracker - Issues Encountered & Solutions

This document tracks all issues encountered during development and their resolutions. Use this as a reference for troubleshooting similar problems in the future.

---

## Table of Contents
1. [Firebase Authentication & Firestore Permissions](#1-firebase-authentication--firestore-permissions)
2. [Firebase Admin SDK Configuration](#2-firebase-admin-sdk-configuration)
3. [Firestore Index Requirements](#3-firestore-index-requirements)
4. [Module Import Errors](#4-module-import-errors)
5. [Environment Configuration](#5-environment-configuration)

---

## 1. Firebase Authentication & Firestore Permissions

### Issue 1.1: "Missing or insufficient permissions" (403 Error)

**Error Message:**
```
FirebaseError: Missing or insufficient permissions
Code: 7 PERMISSION_DENIED
```

**Symptom:**
- Unable to create or read investments from Firestore
- Frontend shows "Failed to create investment" error
- Backend logs show permission denied errors

**Root Cause:**
Firestore security rules require authentication, but the backend was attempting to use:
- REST API with only an API key (no authentication context)
- Firebase Admin SDK without proper service account credentials

**Resolution:**

#### Step 1: Download Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `pokemon-portfolio-dfcf4`
3. Click gear icon (⚙️) → **Project settings**
4. Navigate to **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Save as `backend/serviceAccountKey.json`

#### Step 2: Configure Firebase Admin SDK
Updated `backend/services/firebase.js`:
```javascript
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const initializeFirebase = () => {
  try {
    if (admin.apps.length > 0) {
      console.log('Firebase Admin already initialized');
      return admin.firestore();
    }

    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('Service account key not found!');
    }

    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    });

    console.log('✅ Firebase Admin initialized with service account credentials');
    console.log(`📁 Project ID: ${serviceAccount.project_id}`);

    return admin.firestore();
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    throw error;
  }
};

const db = initializeFirebase();
module.exports = { admin, db };
```

#### Step 3: Update Controllers to Use Admin SDK
Changed from REST API to Firebase Admin SDK methods in `backend/controllers/investmentController.js`:

**Before (REST API):**
```javascript
const investments = await db.query('investments', userId, 'createdAt', 'DESCENDING');
```

**After (Admin SDK):**
```javascript
const snapshot = await db
  .collection('investments')
  .where('userId', '==', userId)
  .orderBy('createdAt', 'desc')
  .get();

const investments = [];
snapshot.forEach((doc) => {
  investments.push({
    id: doc.id,
    ...doc.data(),
  });
});
```

#### Step 4: Security Configuration
Added `serviceAccountKey.json` to `.gitignore`:
```gitignore
# Firebase
firebase-adminsdk*.json
serviceAccountKey.json
```

**Why This Works:**
- Firebase Admin SDK bypasses Firestore security rules when using service account credentials
- Backend acts with admin privileges on behalf of authenticated users
- Frontend still enforces user-level security through Firebase Auth

**Files Modified:**
- `backend/services/firebase.js`
- `backend/controllers/investmentController.js`
- `backend/.env.example`
- `.gitignore`

---

## 2. Firebase Admin SDK Configuration

### Issue 2.1: "Could not load the default credentials"

**Error Message:**
```
Error: Could not load the default credentials.
Browse to https://cloud.google.com/docs/authentication/getting-started for more information.
```

**Symptom:**
- Backend crashes on startup
- No database connection established
- Server logs show authentication errors

**Root Cause:**
Firebase Admin SDK was initialized without credentials:
```javascript
// ❌ WRONG - No credentials provided
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
});
```

**Resolution:**
Provide service account credentials (see Issue 1.1 above)

**Prevention:**
- Always use service account key file for backend Firebase Admin
- Never use client-side Firebase SDK (`firebase/app`, `firebase/firestore`) in backend
- Keep `serviceAccountKey.json` in `.gitignore`

---

## 3. Firestore Index Requirements

### Issue 3.1: "The query requires an index" (FAILED_PRECONDITION)

**Error Message:**
```
Error: 9 FAILED_PRECONDITION: The query requires an index.
You can create it here: https://console.firebase.google.com/v1/r/project/pokemon-portfolio-dfcf4/firestore/indexes?create_composite=...
```

**Symptom:**
- Investment creation succeeds (POST works)
- Investment retrieval fails (GET returns 500 error)
- Frontend shows empty portfolio despite successful creation
- Developer tools show: "Failed to load resource: the server responded with a status of 500 (Internal Server Error)"

**Root Cause:**
Firestore composite queries require an index when:
1. Filtering by a field (`where('userId', '==', userId)`)
2. AND sorting by a different field (`orderBy('createdAt', 'desc')`)

The query in `backend/controllers/investmentController.js`:
```javascript
const snapshot = await db
  .collection('investments')
  .where('userId', '==', userId)      // Filter
  .orderBy('createdAt', 'desc')       // Sort
  .get();
```

This requires a composite index on `userId` + `createdAt`.

**Resolution:**

#### Method 1: Use Auto-Generated Link (Fastest)
1. Copy the index creation URL from error logs
2. Paste in browser (will look like):
   ```
   https://console.firebase.google.com/v1/r/project/pokemon-portfolio-dfcf4/firestore/indexes?create_composite=...
   ```
3. Click **"Create Index"**
4. Wait 1-2 minutes for index to build

#### Method 2: Manual Creation
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Configure:
   - **Collection ID**: `investments`
   - **Field 1**: `userId` (Ascending)
   - **Field 2**: `createdAt` (Descending)
   - **Query scope**: Collection
6. Click **Create**
7. Wait for "Building" to complete (1-2 minutes)

**Index Configuration:**
```
Collection: investments
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

**Verification:**
Once index is ready:
1. Refresh the frontend application
2. Investments should now load successfully
3. Check Firebase Console → Indexes to see status

**Prevention:**
- Create indexes proactively during development
- Document required indexes in project README
- Consider using `firestore.indexes.json` for index definitions

**Related Documentation:**
- Firebase: https://firebase.google.com/docs/firestore/query-data/indexing
- Index best practices: https://firebase.google.com/docs/firestore/query-data/index-overview

---

## 4. Module Import Errors

### Issue 4.1: "Cannot find module 'firebase/app'"

**Error Message:**
```
Error: Cannot find module 'firebase/app'
Error: Cannot find module 'firebase/firestore'
Error: Cannot find module 'firebase/auth'
```

**Symptom:**
- Backend crashes immediately on startup
- Module not found errors in Node.js
- Server fails to initialize

**Root Cause:**
Backend code was importing client-side Firebase packages:
```javascript
// ❌ WRONG - These are client-side packages
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
```

**Resolution:**
Use Firebase Admin SDK instead:
```javascript
// ✅ CORRECT - Server-side package
const admin = require('firebase-admin');
const db = admin.firestore();
```

**Key Differences:**

| Client SDK (`firebase`) | Admin SDK (`firebase-admin`) |
|------------------------|------------------------------|
| Frontend/client-side only | Backend/server-side only |
| Requires API key | Requires service account |
| Subject to security rules | Bypasses security rules |
| Browser & React Native | Node.js only |

**Files Affected:**
- `backend/services/firebase.js`
- `backend/middleware/authMiddleware.js`
- `backend/controllers/investmentController.js`

---

## 5. Environment Configuration

### Issue 5.1: Missing Environment Variables

**Symptom:**
- Server starts but can't connect to Firebase
- `undefined` values for configuration
- Connection timeout errors

**Root Cause:**
Missing or incorrect `.env` file configuration

**Resolution:**

#### Backend `.env` Template:
```env
PORT=5000
NODE_ENV=development

# Firebase Configuration
# Note: Backend uses serviceAccountKey.json for authentication
FIREBASE_PROJECT_ID=pokemon-portfolio-dfcf4

# Optional: Alternative to serviceAccountKey.json file
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

#### Frontend `.env` Template:
```env
# Backend API
VITE_API_URL=http://localhost:5000/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDVj2d38nTG7-UsxkWIwCEP0L4XVxFDpNM
VITE_FIREBASE_AUTH_DOMAIN=pokemon-portfolio-dfcf4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pokemon-portfolio-dfcf4
VITE_FIREBASE_STORAGE_BUCKET=pokemon-portfolio-dfcf4.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=722501677733
VITE_FIREBASE_APP_ID=1:722501677733:web:3ec014d14c172b27c7d34c
```

**Prevention:**
- Always maintain `.env.example` files
- Document all required environment variables
- Never commit `.env` files to version control

---

## 6. Firestore REST API Issues (Deprecated Approach)

### Issue 6.1: REST API 403 Errors

**Error Message:**
```
AxiosError: Request failed with status code 403
Firestore query error: Missing or insufficient permissions
```

**Symptom:**
- All Firestore operations return 403
- Using `https://firestore.googleapis.com/v1/projects/...` endpoints
- API key alone insufficient for authentication

**Root Cause:**
Attempted to use Firestore REST API with only an API key. REST API requires:
- Authenticated user ID token, OR
- OAuth 2.0 credentials, OR
- Service account with proper scope

**Why REST API Failed:**
```javascript
// ❌ This approach doesn't work with security rules
const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
const response = await axios.post(url, query, {
  params: { key: API_KEY }  // API key alone is insufficient!
});
```

**Resolution:**
Switched to Firebase Admin SDK (see Issue 1.1) which properly handles authentication with service account credentials.

**Files Removed:**
- `backend/services/firestore.js` (REST API wrapper - no longer needed)

---

## Common Error Patterns & Quick Fixes

### Pattern 1: Permission Denied Errors
**Symptoms:** 403, "Missing permissions", "Permission denied"
**Quick Fix:** Verify service account key is loaded correctly

**Check:**
```bash
# Backend should show this on startup:
✅ Firebase Admin initialized with service account credentials
📁 Project ID: pokemon-portfolio-dfcf4
```

### Pattern 2: Index Missing Errors
**Symptoms:** "FAILED_PRECONDITION", "query requires an index"
**Quick Fix:** Click the index creation link in error message

### Pattern 3: Module Not Found
**Symptoms:** "Cannot find module 'firebase/...'"
**Quick Fix:** Use `firebase-admin` instead of `firebase` in backend

### Pattern 4: Connection Timeouts
**Symptoms:** "ECONNREFUSED", "Connection timeout"
**Quick Fix:**
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Ensure no firewall blocking localhost connections

---

## Debugging Checklist

### When investments won't create:
- [ ] Service account key file exists: `backend/serviceAccountKey.json`
- [ ] Backend logs show: "✅ Firebase Admin initialized with service account credentials"
- [ ] POST request succeeds (check browser Network tab)
- [ ] Check backend logs for actual error messages

### When investments won't display:
- [ ] POST succeeded (investment was created)
- [ ] GET request failing with 500 error
- [ ] Backend logs show "FAILED_PRECONDITION" or index error
- [ ] Create required Firestore index
- [ ] Wait 1-2 minutes for index to build
- [ ] Refresh browser

### When backend crashes:
- [ ] Check for "Cannot find module" errors → Use correct SDK
- [ ] Check for "Could not load credentials" → Add service account key
- [ ] Check for syntax errors in recent changes
- [ ] Verify all required npm packages installed

### When frontend can't connect:
- [ ] Backend server is running (check terminal)
- [ ] Backend shows "🚀 Server is running on port 5000"
- [ ] Frontend `.env` has correct `VITE_API_URL=http://localhost:5000/api`
- [ ] Check browser console for CORS errors
- [ ] Try accessing `http://localhost:5000/api/investments` directly

---

## Best Practices Going Forward

### 1. Firebase Configuration
- ✅ Use Firebase Admin SDK with service account in backend
- ✅ Use client Firebase SDK in frontend only
- ✅ Keep service account key in `.gitignore`
- ✅ Document all required indexes

### 2. Error Handling
- ✅ Add descriptive error messages
- ✅ Log errors with context (userId, action, timestamp)
- ✅ Return user-friendly errors to frontend
- ✅ Never expose sensitive info in error messages

### 3. Development Workflow
- ✅ Test queries in Firebase Console first
- ✅ Create indexes before deploying queries
- ✅ Use `.env.example` to document required variables
- ✅ Keep this error-handling.md updated with new issues

### 4. Security
- ✅ Never commit `.env` files
- ✅ Never commit `serviceAccountKey.json`
- ✅ Rotate service account keys periodically
- ✅ Use environment-specific Firebase projects

---

## Useful Commands

### Check backend is running:
```bash
curl http://localhost:5000/api/investments
```

### Test with authentication:
```bash
curl -H "Authorization: Bearer test" \
     -H "x-user-id: YOUR_USER_ID" \
     http://localhost:5000/api/investments
```

### View backend logs:
```bash
cd backend && npm run dev
# Look for errors in console output
```

### Restart both servers:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

## Issue Timeline Summary

| Date | Issue | Resolution | Time to Fix |
|------|-------|------------|-------------|
| Oct 14, 2025 | Permission denied errors | Added service account credentials | ~30 min |
| Oct 14, 2025 | Module import errors | Switched to Firebase Admin SDK | ~10 min |
| Oct 14, 2025 | REST API 403 errors | Replaced REST API with Admin SDK | ~20 min |
| Oct 14, 2025 | Missing Firestore index | Created composite index via console | ~5 min |

**Total debugging time:** ~65 minutes
**Total issues resolved:** 4 major issues + multiple sub-issues

---

## Additional Resources

### Firebase Documentation
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Service Account Credentials](https://cloud.google.com/docs/authentication/getting-started)

### Project Documentation
- [README.md](./README.md) - Project overview and setup
- [specification Plan.md](./specification%20Plan.md) - Detailed technical specs
- [QUICKSTART.md](./QUICKSTART.md) - Quick setup guide
- [FIREBASE_SECURITY_RULES.md](./FIREBASE_SECURITY_RULES.md) - Security rules documentation

---

## Contact & Support

For new issues:
1. Check this document first
2. Search error message in Firebase documentation
3. Check Firebase Console for helpful error links
4. Review backend logs for detailed error messages
5. Test endpoints directly with curl

**Last Updated:** October 14, 2025
**Project:** Pokemon Crypto Portfolio Tracker
**Version:** 1.0
