# Pokemon Crypto Portfolio Tracker - Specification Plan

## Project Overview
A Pokemon-themed cryptocurrency portfolio tracking application that displays your investor level as Pokemon images based on your total portfolio value. The Pokemon displayed progresses from lightest to heaviest as your portfolio grows.

---

## Core Features

### 1. Investment Management
- **Add Investment Entry**: Users can add a cryptocurrency investment by entering:
  - Token ticker symbol (e.g., BTC, ETH, SOL)
  - Number of tokens held
  - Price is automatically fetched from Dexscreener API

- **View Investments**: Display all investment entries with:
  - Token name/ticker
  - Number of tokens held
  - Current price (USD)
  - Total holdings value (tokens × price)

- **Edit Investment**: Modify existing entries:
  - Update number of tokens held
  - Change token ticker

- **Delete Investment**: Remove investment entries from portfolio

### 2. Automatic Calculations
- **Holdings Calculation**: Automatically calculate individual investment value
  ```
  Holdings Value = Token Amount × Current Token Price
  ```

- **Total Portfolio Value**: Sum all individual holdings
  ```
  Total Portfolio = Σ(All Investment Holdings)
  ```

### 3. Pokemon Investment Level System

#### Level Progression Formula
- **Starting Level**: $100 USD
- **Growth Multiplier**: 1.5x
- **Level Thresholds**:
  - Level 1: $100
  - Level 2: $150 ($100 × 1.5)
  - Level 3: $225 ($150 × 1.5)
  - Level 4: $337.50 ($225 × 1.5)
  - Level 5: $506.25 ($337.50 × 1.5)
  - And so on...

#### Pokemon Selection Logic
1. Fetch all Pokemon from PokeAPI
2. Sort Pokemon by weight (ascending - lightest to heaviest)
3. Map portfolio value levels to Pokemon index
4. Display Pokemon sprite based on current level

#### Visual Display
- Show Pokemon image/sprite
- Display current portfolio value
- Show next level threshold
- Progress bar to next level (optional)

---

## Technical Architecture

### Frontend (React)

#### Component Structure
```
src/
├── components/
│   ├── Dashboard.jsx           # Main container
│   ├── InvestmentForm.jsx      # Add/Edit investment form
│   ├── InvestmentList.jsx      # List all investments
│   ├── InvestmentItem.jsx      # Single investment row
│   ├── PokemonEmblem.jsx       # Pokemon display component
│   ├── PortfolioSummary.jsx    # Total value display
│   └── LevelProgress.jsx       # Progress to next level
├── services/
│   ├── api.js                  # API calls to backend
│   ├── firebase.js             # Firebase configuration
│   └── calculations.js         # Portfolio calculations
├── context/
│   └── PortfolioContext.jsx    # Global state management
├── hooks/
│   ├── useInvestments.js       # Investment CRUD operations
│   └── usePokemon.js           # Pokemon data fetching
├── utils/
│   ├── pokemonLevel.js         # Level calculation logic
│   └── formatting.js           # Number formatting utilities
└── App.jsx                     # Root component
```

#### Key React Features
- **State Management**: Context API for global portfolio state
- **Real-time Updates**: Periodic price refresh (every 30 seconds)
- **Responsive Design**: Mobile-friendly interface
- **Form Validation**: Input validation for token ticker and amounts

### Backend (Node.js/Express)

#### API Endpoints

##### Investment Endpoints
```javascript
POST   /api/investments          # Create new investment
GET    /api/investments          # Get all investments
GET    /api/investments/:id      # Get single investment
PUT    /api/investments/:id      # Update investment
DELETE /api/investments/:id      # Delete investment
```

##### External API Integration
```javascript
GET    /api/price/:ticker        # Get current token price from Dexscreener
GET    /api/pokemon/by-weight    # Get sorted Pokemon list
GET    /api/pokemon/:level       # Get Pokemon for specific level
```

#### Server Structure
```
server/
├── server.js                    # Express app entry point
├── routes/
│   ├── investments.js           # Investment CRUD routes
│   ├── prices.js                # Price fetching routes
│   └── pokemon.js               # Pokemon data routes
├── controllers/
│   ├── investmentController.js  # Investment logic
│   ├── priceController.js       # Dexscreener integration
│   └── pokemonController.js     # PokeAPI integration
├── services/
│   ├── dexscreener.js           # Dexscreener API service
│   ├── pokeapi.js               # PokeAPI service
│   └── firebase.js              # Firebase admin SDK
├── middleware/
│   ├── errorHandler.js          # Error handling middleware
│   └── validation.js            # Request validation
└── utils/
    └── cache.js                 # API response caching
```

### Database (Firebase Firestore)

#### Collections Structure

##### investments Collection
```javascript
{
  id: "auto-generated-id",
  userId: "user-id",              // For future multi-user support
  tokenTicker: "BTC",             // Token symbol
  tokenAmount: 0.5,               // Number of tokens held
  createdAt: Timestamp,           // Creation timestamp
  updatedAt: Timestamp            // Last update timestamp
}
```

##### pokemonCache Collection (optional)
```javascript
{
  id: "pokemon-list",
  pokemonData: [...],             // Cached Pokemon data sorted by weight
  lastUpdated: Timestamp,         // Cache timestamp
  ttl: 86400000                   // Time to live (24 hours)
}
```

#### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /investments/{investmentId} {
      allow read, write: if true;  // For MVP - add authentication later
    }
  }
}
```

---

## API Integration Details

### 1. Dexscreener API

#### Endpoint
```
GET https://api.dexscreener.com/token-profiles/latest/v1
```

#### Usage in Application
To get token price by ticker, we'll need to search for the token and extract price data from the response.

**Note**: Dexscreener API might require token contract address rather than ticker symbol. Implementation will include:
1. Token search/lookup functionality
2. Price extraction from response
3. Error handling for invalid tickers

#### Response Structure
```javascript
{
  url: "string",
  chainId: "string",
  tokenAddress: "string",
  icon: "string",
  header: "string",
  description: "string",
  links: [...]
}
```

### 2. PokeAPI

#### Get Pokemon List
```
GET https://pokeapi.co/api/v2/pokemon?limit=1000
```

#### Get Individual Pokemon Data
```
GET https://pokeapi.co/api/v2/pokemon/{id}
```

#### Response Structure (Individual Pokemon)
```javascript
{
  id: 1,
  name: "bulbasaur",
  weight: 69,                    // Weight in hectograms
  sprites: {
    front_default: "image_url",  // Main sprite image
    other: {
      "official-artwork": {
        front_default: "hq_image_url"
      }
    }
  },
  // ... other data
}
```

#### Pokemon Weight Sorting Strategy
1. Fetch all Pokemon (currently ~1000+ Pokemon)
2. For each Pokemon, fetch individual data to get weight
3. Sort by weight (ascending)
4. Cache the sorted list
5. Use index position to map to portfolio levels

---

## Pokemon Level Calculation Algorithm

### JavaScript Implementation

```javascript
/**
 * Calculate the portfolio level based on total value
 * @param {number} totalValue - Total portfolio value in USD
 * @returns {number} - Level number (0-based index)
 */
function calculateLevel(totalValue) {
  if (totalValue < 100) return 0; // Below minimum threshold

  let level = 0;
  let threshold = 100;

  while (totalValue >= threshold) {
    level++;
    threshold = threshold * 1.5;
  }

  return level;
}

/**
 * Get the threshold value for a specific level
 * @param {number} level - Level number
 * @returns {number} - Threshold value in USD
 */
function getLevelThreshold(level) {
  if (level === 0) return 0;
  return 100 * Math.pow(1.5, level - 1);
}

/**
 * Get next level threshold
 * @param {number} currentLevel - Current level
 * @returns {number} - Next level threshold
 */
function getNextThreshold(currentLevel) {
  return getLevelThreshold(currentLevel + 1);
}

/**
 * Calculate progress to next level (0-100)
 * @param {number} totalValue - Current portfolio value
 * @param {number} currentLevel - Current level
 * @returns {number} - Progress percentage
 */
function calculateProgress(totalValue, currentLevel) {
  const currentThreshold = getLevelThreshold(currentLevel);
  const nextThreshold = getNextThreshold(currentLevel);
  const progress = ((totalValue - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}
```

### Pokemon Mapping

```javascript
/**
 * Get Pokemon for a specific level
 * @param {number} level - Portfolio level
 * @param {Array} sortedPokemon - Pokemon array sorted by weight
 * @returns {Object} - Pokemon data
 */
function getPokemonForLevel(level, sortedPokemon) {
  // Map level to Pokemon index
  // If level exceeds Pokemon count, use the heaviest Pokemon
  const index = Math.min(level, sortedPokemon.length - 1);
  return sortedPokemon[index];
}
```

---

## Data Flow Diagrams

### Adding New Investment
```
User Input (ticker, amount)
    ↓
Frontend validates input
    ↓
Call backend API to fetch token price
    ↓
Backend calls Dexscreener API
    ↓
Calculate holdings (amount × price)
    ↓
Save to Firebase
    ↓
Update UI with new investment
    ↓
Recalculate total portfolio value
    ↓
Update Pokemon level display
```

### Portfolio Value Update
```
Timer triggers (every 30s)
    ↓
Fetch all investments from Firebase
    ↓
For each investment:
  - Call Dexscreener API for current price
  - Calculate current holdings
    ↓
Sum all holdings for total portfolio value
    ↓
Calculate current level
    ↓
Fetch appropriate Pokemon
    ↓
Update UI
```

---

## User Interface Design

### Dashboard Layout
```
┌─────────────────────────────────────────────┐
│          Pokemon Portfolio Tracker          │
├─────────────────────────────────────────────┤
│                                             │
│         [Pokemon Image Display]             │
│                                             │
│     Investment Level: {level}               │
│     Total Portfolio: ${totalValue}          │
│     Next Level: ${nextThreshold}            │
│                                             │
│     [Progress Bar ████████░░░░ 75%]        │
│                                             │
├─────────────────────────────────────────────┤
│  Add New Investment                         │
│  Token: [_______]  Amount: [_______]        │
│                         [Add] button        │
├─────────────────────────────────────────────┤
│  Your Investments                           │
│  ┌─────────────────────────────────────┐   │
│  │ BTC  | 0.5 tokens | $42,500 | $21,250│   │
│  │                    [Edit] [Delete]   │   │
│  ├─────────────────────────────────────┤   │
│  │ ETH  | 2.5 tokens | $3,200  | $8,000 │   │
│  │                    [Edit] [Delete]   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Color Scheme (Pokemon Theme)
- Primary: Red (#DC0A2D)
- Secondary: Yellow (#FFCB05)
- Background: Light Blue (#3B4CCA)
- Text: White (#FFFFFF)
- Accent: Blue (#0075BE)

---

## Development Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Git

### Step 1: Project Initialization

#### Frontend Setup
```bash
# Create React app
npx create-vite@latest frontend --template react
cd frontend
npm install

# Install dependencies
npm install firebase axios react-router-dom
```

#### Backend Setup
```bash
# Create backend directory
mkdir backend
cd backend
npm init -y

# Install dependencies
npm install express cors dotenv firebase-admin axios node-cache
npm install --save-dev nodemon
```

### Step 2: Firebase Configuration

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Generate service account key (Project Settings → Service Accounts)
4. Download the JSON key file
5. Create `.env` file in backend directory:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
PORT=5000
```

6. In frontend, add Firebase config:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 3: Environment Variables

#### Backend .env
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
NODE_ENV=development
```

#### Frontend .env
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Step 4: Running the Application

#### Start Backend
```bash
cd backend
npm run dev
```

#### Start Frontend
```bash
cd frontend
npm run dev
```

---

## Testing Checklist

### Investment Management
- [ ] Add new investment with valid ticker
- [ ] Add investment with invalid ticker (error handling)
- [ ] Edit investment amount
- [ ] Delete investment
- [ ] View all investments

### Calculations
- [ ] Holdings calculated correctly (amount × price)
- [ ] Total portfolio sum is accurate
- [ ] Prices update automatically
- [ ] Calculations update when investment is modified

### Pokemon Level System
- [ ] Correct Pokemon displayed for portfolio value
- [ ] Pokemon changes when crossing threshold
- [ ] Progress bar shows accurate percentage
- [ ] Level thresholds follow 1.5x multiplier
- [ ] Handles portfolio value below $100
- [ ] Handles very large portfolio values

### API Integration
- [ ] Dexscreener API returns valid prices
- [ ] PokeAPI returns Pokemon data
- [ ] Cached Pokemon data reduces API calls
- [ ] Error handling for API failures
- [ ] Retry logic for failed requests

### User Interface
- [ ] Responsive design on mobile
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Form validation works
- [ ] Pokemon image loads and displays

---

## Deployment Guide

### Backend Deployment (Options)

#### Option 1: Heroku
```bash
heroku create pokemon-portfolio-api
heroku config:set FIREBASE_PROJECT_ID=your-id
git push heroku main
```

#### Option 2: Railway
```bash
railway init
railway up
```

#### Option 3: Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Frontend Deployment (Options)

#### Option 1: Vercel
```bash
npm install -g vercel
vercel
```

#### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## Future Enhancements

### Phase 2 Features
1. **User Authentication**
   - Firebase Authentication
   - Multiple users with separate portfolios

2. **Historical Data**
   - Track portfolio value over time
   - Charts and graphs
   - Price history for each investment

3. **Notifications**
   - Level-up notifications
   - Price alerts
   - Portfolio milestones

4. **Social Features**
   - Share Pokemon emblem
   - Leaderboard
   - Achievement system

5. **Advanced Pokemon System**
   - Shiny variants for special milestones
   - Evolution animations
   - Legendary Pokemon for top holders

6. **Portfolio Analytics**
   - ROI calculations
   - Profit/loss tracking
   - Performance metrics

---

## API Rate Limits & Caching Strategy

### Dexscreener API
- **Rate Limits**: Monitor for rate limiting
- **Caching**: Cache prices for 30 seconds
- **Fallback**: Display last known price if API fails

### PokeAPI
- **Rate Limits**: No official limit, but be respectful
- **Caching**: Cache full Pokemon list for 24 hours
- **Strategy**: Fetch all Pokemon data on server startup

---

## Error Handling

### Common Error Scenarios

1. **Invalid Token Ticker**
   - Display: "Token not found. Please check the ticker symbol."
   - Action: Don't save to database

2. **API Connection Failure**
   - Display: "Unable to fetch price. Using last known price."
   - Action: Use cached data

3. **Database Connection Error**
   - Display: "Connection error. Please try again."
   - Action: Retry with exponential backoff

4. **Invalid Input**
   - Display: "Please enter a valid amount."
   - Action: Prevent form submission

---

## Performance Considerations

### Frontend
- Lazy load Pokemon images
- Debounce input fields
- Memoize calculations
- Virtual scrolling for large lists

### Backend
- Cache Pokemon data in memory
- Rate limit API requests
- Use connection pooling
- Implement request queuing

### Database
- Index on userId field
- Batch reads when possible
- Use Firebase offline persistence
- Implement pagination for large datasets

---

## Security Considerations

### API Security
- Validate all inputs
- Sanitize user data
- Rate limit endpoints
- Use CORS properly

### Firebase Security
- Implement proper security rules
- Never expose service account keys
- Use environment variables
- Enable authentication before production

### Data Privacy
- Don't store sensitive data
- Implement data encryption
- Add privacy policy
- GDPR compliance considerations

---

## Maintenance & Monitoring

### Logs to Track
- API request failures
- Database errors
- Price fetch failures
- User actions (for debugging)

### Monitoring Tools
- Firebase Console
- Server logs
- Error tracking (Sentry)
- Analytics (Google Analytics)

---

## Support & Documentation

### For Developers
- API documentation in `/docs/api.md`
- Component documentation in code comments
- Setup guide in README.md

### For Users
- How-to guide for adding investments
- FAQ section
- Contact support information

---

## Project Timeline Estimate

### Week 1: Setup & Infrastructure
- Day 1-2: Project initialization, Firebase setup
- Day 3-4: Backend API structure
- Day 5-7: Frontend structure, basic UI

### Week 2: Core Features
- Day 8-10: Investment CRUD operations
- Day 11-12: API integrations (Dexscreener, PokeAPI)
- Day 13-14: Portfolio calculations

### Week 3: Pokemon System
- Day 15-17: Pokemon level logic
- Day 18-19: Pokemon display component
- Day 20-21: Level progression UI

### Week 4: Polish & Deploy
- Day 22-24: Testing & bug fixes
- Day 25-26: UI refinements
- Day 27-28: Deployment & documentation

---

## Glossary

- **Ticker**: Token symbol (e.g., BTC, ETH)
- **Holdings**: Total value of a specific investment
- **Portfolio Value**: Sum of all holdings
- **Investment Level**: Tier based on portfolio value
- **Pokemon Emblem**: Pokemon image representing current level
- **Threshold**: Minimum portfolio value for a level

---

## Contact & Support

For questions or issues:
- GitHub Issues: [repository-url]
- Email: [your-email]
- Discord: [discord-server]

---

**Document Version**: 1.0
**Last Updated**: October 14, 2025
**Author**: Pokemon Portfolio Tracker Team
