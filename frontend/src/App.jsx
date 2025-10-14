import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css';

const AppContent = () => {
  const { currentUser } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (!currentUser) {
    return showSignup ? (
      <Signup onToggleMode={() => setShowSignup(false)} />
    ) : (
      <Login onToggleMode={() => setShowSignup(true)} />
    );
  }

  return (
    <PortfolioProvider>
      <Dashboard />
    </PortfolioProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
