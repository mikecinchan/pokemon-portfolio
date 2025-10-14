import { PortfolioProvider } from './context/PortfolioContext';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <PortfolioProvider>
      <Dashboard />
    </PortfolioProvider>
  );
}

export default App;
