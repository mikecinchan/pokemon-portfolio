# Deployment Guide

## Pokemon Crypto Portfolio Tracker - Deployment Instructions

This guide covers deploying the application to GitHub and setting it up for production hosting.

---

## Table of Contents
1. [GitHub Deployment](#github-deployment)
2. [Environment Setup for New Developers](#environment-setup-for-new-developers)
3. [Production Deployment Options](#production-deployment-options)
4. [Security Checklist](#security-checklist)

---

## GitHub Deployment

### Prerequisites
- Git installed locally
- GitHub account
- Repository with all commits ready

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Configure repository:
   - **Name**: `pokemon-crypto-portfolio` (or your preferred name)
   - **Description**: `A Pokemon-themed cryptocurrency portfolio tracker with gamified investment levels`
   - **Visibility**: Public or Private (your choice)
   - **DO NOT** check "Initialize with README" (we already have one)
3. Click **"Create repository"**

### Step 2: Connect Local Repository to GitHub

```bash
# Navigate to project directory
cd "C:\Users\USER\Desktop\Projects\Pokemon Portfolio"

# Add GitHub as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/pokemon-crypto-portfolio.git

# Verify remote was added
git remote -v

# Push to GitHub
git push -u origin master
```

### Step 3: Verify Push Success

1. Refresh your GitHub repository page
2. You should see all files and commit history
3. Verify sensitive files are NOT present:
   - ✅ `.env` files should be missing
   - ✅ `serviceAccountKey.json` should be missing
   - ✅ `node_modules/` should be missing

---

## Environment Setup for New Developers

When someone clones your repository, they'll need to set up their environment:

### Step 1: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/pokemon-crypto-portfolio.git
cd pokemon-crypto-portfolio
```

### Step 2: Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Step 3: Firebase Setup

#### A. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Create new project (or use existing)
3. Enable Firestore Database
4. Enable Firebase Authentication

#### B. Get Frontend Credentials
1. In Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Click Web app (</>) icon
4. Copy the firebaseConfig object

#### C. Get Backend Credentials
1. In Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save JSON file as `backend/serviceAccountKey.json`

#### D. Configure Firestore Security Rules
1. Go to Firestore Database → Rules
2. Copy rules from `FIREBASE_SECURITY_RULES.md`
3. Click "Publish"

#### E. Create Required Indexes
1. In Firestore → Indexes tab
2. Create composite index:
   - Collection: `investments`
   - Field 1: `userId` (Ascending)
   - Field 2: `createdAt` (Descending)
3. Wait for index to build (~2 minutes)

### Step 4: Environment Configuration

#### Backend `.env`
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
```

#### Frontend `.env`
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 5: Run Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Application should now be running at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## Production Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel
1. Go to https://vercel.com
2. Click "Import Project"
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables (all `VITE_*` variables)
6. Deploy

#### Backend on Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select repository
4. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `PORT`, `NODE_ENV`, `FIREBASE_PROJECT_ID`
   - Upload `serviceAccountKey.json` as file or use env vars
6. Deploy

#### Update Frontend to Use Production Backend
In frontend `.env.production`:
```env
VITE_API_URL=https://your-railway-app.railway.app/api
```

### Option 2: Render (Full Stack)

#### Backend
1. Go to https://render.com
2. Create "New Web Service"
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables
6. Add `serviceAccountKey.json` as secret file

#### Frontend
1. Create "New Static Site"
2. Connect same repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables

### Option 3: Self-Hosted (VPS)

#### Requirements
- Ubuntu/Debian server
- Node.js 18+
- Nginx
- PM2 for process management

#### Setup Script
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone https://github.com/YOUR_USERNAME/pokemon-crypto-portfolio.git
cd pokemon-crypto-portfolio

# Backend setup
cd backend
npm install
# Configure .env and serviceAccountKey.json
pm2 start server.js --name pokemon-backend

# Frontend setup
cd ../frontend
npm install
npm run build
# Serve dist/ with Nginx
```

---

## Security Checklist

### Before Deploying to GitHub
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Verify `serviceAccountKey.json` is in `.gitignore`
- [ ] Run `git status` to check no sensitive files are staged
- [ ] Run `git ls-files | grep -E "(\.env|serviceAccountKey)"` should return empty

### Before Production Deployment
- [ ] Update Firestore security rules (remove test mode rules)
- [ ] Enable Firebase App Check
- [ ] Set up CORS properly in backend
- [ ] Use HTTPS for all connections
- [ ] Enable rate limiting on API endpoints
- [ ] Review and update security rules in `FIREBASE_SECURITY_RULES.md`
- [ ] Set up monitoring and error tracking (e.g., Sentry)
- [ ] Configure production environment variables
- [ ] Rotate service account keys periodically
- [ ] Set up automated backups for Firestore

### Production Environment Variables

#### Backend
```env
NODE_ENV=production
PORT=5000
FIREBASE_PROJECT_ID=your-prod-project-id

# Optional: Use environment vars instead of serviceAccountKey.json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

#### Frontend
```env
VITE_API_URL=https://your-production-backend.com/api
VITE_FIREBASE_API_KEY=your-production-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-prod-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-prod-app-id
```

---

## CI/CD Setup (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [master]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend
          npm install
      - name: Run tests
        run: |
          cd backend
          npm test
      # Add deployment steps for your hosting platform

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install and build
        run: |
          cd frontend
          npm install
          npm run build
      # Add deployment steps for your hosting platform
```

---

## Troubleshooting Deployment Issues

### Issue: "Remote already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/repo-name.git
```

### Issue: "Authentication failed"
- Make sure you're logged into GitHub
- Use Personal Access Token instead of password
- Or set up SSH keys: https://docs.github.com/en/authentication

### Issue: "Push rejected"
```bash
# Pull first, then push
git pull origin master --rebase
git push origin master
```

### Issue: Production app can't connect to backend
- Verify backend URL in frontend `.env.production`
- Check CORS settings in backend
- Verify backend is running and accessible
- Check firewall and security group rules

### Issue: Firebase permissions in production
- Verify service account key is loaded correctly
- Check Firestore security rules are published
- Verify Firebase project is in production mode

---

## Monitoring & Maintenance

### Recommended Tools
- **Error Tracking**: Sentry, Rollbar
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Analytics**: Google Analytics, Plausible
- **Logs**: LogRocket, Papertrail
- **Performance**: Lighthouse, WebPageTest

### Regular Maintenance Tasks
- [ ] Monitor error rates and logs weekly
- [ ] Review and optimize database queries monthly
- [ ] Update dependencies quarterly
- [ ] Rotate service account keys quarterly
- [ ] Review and update security rules quarterly
- [ ] Backup Firestore data monthly
- [ ] Check and optimize Firebase usage/costs monthly

---

## Support & Documentation

### Internal Documentation
- [README.md](./README.md) - Project overview
- [QUICKSTART.md](./QUICKSTART.md) - Quick setup guide
- [error-handling.md](./error-handling.md) - Troubleshooting guide
- [FIREBASE_SECURITY_RULES.md](./FIREBASE_SECURITY_RULES.md) - Security configuration

### External Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## Contact

For deployment issues or questions:
- Check [error-handling.md](./error-handling.md)
- Review platform-specific documentation
- Check GitHub Issues for similar problems

**Last Updated:** October 14, 2025
**Project Version:** 1.0
