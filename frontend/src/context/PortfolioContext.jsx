import { createContext, useContext, useState, useEffect } from 'react';
import { investmentsAPI, pricesAPI, pokemonAPI } from '../services/api';
import { getLevelInfo } from '../utils/pokemonLevel';

const PortfolioContext = createContext();

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider = ({ children }) => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalValue, setTotalValue] = useState(0);
  const [pokemon, setPokemon] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all investments
  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await investmentsAPI.getAll();
      setInvestments(response.data || []);
    } catch (err) {
      console.error('Error fetching investments:', err);
      setError('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total portfolio value with current prices
  const calculateTotalValue = async () => {
    if (investments.length === 0) {
      setTotalValue(0);
      setLevelInfo(getLevelInfo(0));
      setPokemon(null);
      return;
    }

    try {
      setRefreshing(true);
      let total = 0;

      // Fetch current prices for all investments
      const investmentPromises = investments.map(async (investment) => {
        try {
          const priceData = await pricesAPI.getByTicker(investment.tokenTicker);
          const holdings = investment.tokenAmount * priceData.data.price;
          return {
            ...investment,
            currentPrice: priceData.data.price,
            holdings,
          };
        } catch (error) {
          console.error(`Failed to fetch price for ${investment.tokenTicker}:`, error);
          return {
            ...investment,
            currentPrice: 0,
            holdings: 0,
          };
        }
      });

      const updatedInvestments = await Promise.all(investmentPromises);
      total = updatedInvestments.reduce((sum, inv) => sum + inv.holdings, 0);

      setTotalValue(total);
      setInvestments(updatedInvestments);

      // Update level info and Pokemon
      const info = getLevelInfo(total);
      setLevelInfo(info);

      // Fetch Pokemon for current level
      if (total >= 100) {
        const pokemonData = await pokemonAPI.getForPortfolio(total);
        setPokemon(pokemonData.data.pokemon);
      } else {
        setPokemon(null);
      }
    } catch (err) {
      console.error('Error calculating total value:', err);
      setError('Failed to calculate portfolio value');
    } finally {
      setRefreshing(false);
    }
  };

  // Add new investment
  const addInvestment = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await investmentsAPI.create(data);
      await fetchInvestments(); // Refresh list
      await calculateTotalValue(); // Recalculate total
      return response;
    } catch (err) {
      console.error('Error adding investment:', err);
      const errorMsg = err.response?.data?.error || 'Failed to add investment';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update investment
  const updateInvestment = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await investmentsAPI.update(id, data);
      await fetchInvestments(); // Refresh list
      await calculateTotalValue(); // Recalculate total
      return response;
    } catch (err) {
      console.error('Error updating investment:', err);
      const errorMsg = err.response?.data?.error || 'Failed to update investment';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Delete investment
  const deleteInvestment = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await investmentsAPI.delete(id);
      await fetchInvestments(); // Refresh list
      await calculateTotalValue(); // Recalculate total
    } catch (err) {
      console.error('Error deleting investment:', err);
      setError('Failed to delete investment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh prices
  const refreshPrices = async () => {
    await calculateTotalValue();
  };

  // Initial load
  useEffect(() => {
    fetchInvestments();
  }, []);

  // Calculate total when investments change
  useEffect(() => {
    if (investments.length > 0) {
      calculateTotalValue();
    } else {
      setTotalValue(0);
      setLevelInfo(getLevelInfo(0));
      setPokemon(null);
    }
  }, [investments.length]);

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (investments.length > 0) {
        calculateTotalValue();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [investments.length]);

  const value = {
    investments,
    loading,
    error,
    totalValue,
    pokemon,
    levelInfo,
    refreshing,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    refreshPrices,
    fetchInvestments,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};
