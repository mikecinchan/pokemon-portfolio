# Pokemon Crypto Portfolio Tracker

A Pokemon-themed cryptocurrency portfolio tracking application where your investment level is represented by Pokemon images based on weight (from lightest to heaviest).

## Features

- 📊 Track multiple cryptocurrency investments
- 💰 Automatic price fetching from Dexscreener API
- 🎮 Pokemon investment level system (starts at $100, grows by 1.5x)
- ⚡ Real-time portfolio value calculations
- 🔄 Auto-refresh prices every 30 seconds
- ✏️ Add, edit, and delete investment entries
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: Firebase Firestore
- **APIs**: Dexscreener (crypto prices) + PokeAPI (Pokemon data)

## Project Structure

```
Pokemon Portfolio/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Context API for state management
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx          # Main app component
│   └── package.json
├── backend/                  # Node.js backend
│   ├── controllers/         # Request handlers
│   ├── routes/              # API routes
│   ├── services/            # External API integrations
│   ├── middleware/          # Express middleware
│   ├── utils/               # Helper functions
│   └── server.js            # Express server
└── specification Plan.md    # Detailed specification

```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Git

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database:
   - Go to Build → Firestore Database
   - Click "Create database"
   - Start in test mode (for development)

4. Get Firebase credentials:

   **For Frontend:**
   - Go to Project Settings → General
   - Scroll down to "Your apps"
   - Click on Web app (</>) icon
   - Copy the firebaseConfig object

   **For Backend:**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

### 2. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file with your Firebase credentials
# Fill in the following:
# - FIREBASE_PROJECT_ID
# - FIREBASE_CLIENT_EMAIL
# - FIREBASE_PRIVATE_KEY (from downloaded JSON)

# Install dependencies
npm install

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Copy environment template
cp .env.example .env

# Edit .env file with your Firebase web credentials
# Fill in the following:
# - VITE_FIREBASE_API_KEY
# - VITE_FIREBASE_AUTH_DOMAIN
# - VITE_FIREBASE_PROJECT_ID
# - VITE_FIREBASE_STORAGE_BUCKET
# - VITE_FIREBASE_MESSAGING_SENDER_ID
# - VITE_FIREBASE_APP_ID

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

### 4. Firestore Security Rules (Optional for Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /investments/{investmentId} {
      allow read, write: if true;  // Change this in production
    }
  }
}
```

## Usage

1. **Open the application** in your browser
2. **Add an investment**:
   - Enter token ticker (e.g., BTC, ETH, SOL)
   - Enter the amount of tokens you hold
   - Click "Add Investment"
3. **View your portfolio**:
   - See total portfolio value
   - Watch your Pokemon evolve as your portfolio grows!
4. **Manage investments**:
   - Edit: Update token amount or ticker
   - Delete: Remove investment from portfolio
   - Refresh: Manually update prices

## Pokemon Level System

- **Starting Level**: $100 USD
- **Growth Rate**: 1.5x multiplier
- **Level Progression**:
  - Level 1: $100
  - Level 2: $150
  - Level 3: $225
  - Level 4: $337.50
  - And so on...

Each level displays a different Pokemon based on weight, from lightest (Gastly) to heaviest (Groudon).

## API Endpoints

### Investments
- `GET /api/investments` - Get all investments
- `POST /api/investments` - Create investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment

### Prices
- `GET /api/prices/:ticker` - Get token price by ticker

### Pokemon
- `GET /api/pokemon` - Get all Pokemon sorted by weight
- `GET /api/pokemon/for-portfolio?totalValue=100` - Get Pokemon for portfolio value
- `GET /api/pokemon/level/:level` - Get Pokemon by level

## Troubleshooting

### "Token not found" error
- The token ticker might not be available on Dexscreener
- Try using the full token name or contract address
- Check if the token is listed on major DEXes

### Firebase connection issues
- Verify your .env files have correct credentials
- Check Firebase console for any quota limits
- Ensure Firestore is enabled in your project

### Prices not updating
- Check your internet connection
- Verify Dexscreener API is accessible
- Try manually refreshing with the refresh button

## Development

### Running Tests
```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

### Building for Production

```bash
# Frontend build
cd frontend
npm run build

# Backend runs as-is (no build step)
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

- [Dexscreener API](https://dexscreener.com/) for crypto price data
- [PokeAPI](https://pokeapi.co/) for Pokemon data and images
- Pokemon © Nintendo/Game Freak

## Support

For issues or questions:
- Check the [specification Plan.md](./specification%20Plan.md) for detailed information
- Open an issue on GitHub
- Contact the development team

---

Made with ❤️ and Pokeballs
