import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import PokemonEmblem from './PokemonEmblem';
import InvestmentForm from './InvestmentForm';
import InvestmentList from './InvestmentList';
import './Dashboard.css';

const Dashboard = () => {
  const { totalValue, pokemon, levelInfo, error } = usePortfolio();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="app-title">Pokemon Portfolio Tracker</h1>
            <p className="app-subtitle">Track your crypto investments with Pokemon!</p>
          </div>
          <div className="user-section">
            <span className="user-email">{currentUser?.email}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="global-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="dashboard-content">
        <div className="main-section">
          <PokemonEmblem
            pokemon={pokemon}
            levelInfo={levelInfo}
            totalValue={totalValue}
          />
        </div>

        <div className="investments-section">
          <InvestmentForm />
          <InvestmentList />
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>Made with ❤️ by Pokemon Portfolio Team</p>
        <p className="disclaimer">
          Prices are fetched from Dexscreener. This is for tracking purposes only.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
