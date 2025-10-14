import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import InvestmentItem from './InvestmentItem';
import InvestmentForm from './InvestmentForm';
import './InvestmentList.css';

const InvestmentList = () => {
  const { investments, loading, refreshing, refreshPrices } = usePortfolio();
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (investment) => {
    setEditingId(investment.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  if (loading && investments.length === 0) {
    return (
      <div className="investment-list-container">
        <div className="loading">Loading investments...</div>
      </div>
    );
  }

  return (
    <div className="investment-list-container">
      <div className="list-header">
        <h3>Your Investments</h3>
        <button
          onClick={refreshPrices}
          disabled={refreshing}
          className="btn-refresh"
          title="Refresh Prices"
        >
          {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {investments.length === 0 ? (
        <div className="empty-state">
          <p>No investments yet. Add your first investment above!</p>
        </div>
      ) : (
        <div className="investment-list">
          {investments.map((investment) => (
            <div key={investment.id}>
              {editingId === investment.id ? (
                <InvestmentForm
                  editData={investment}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <InvestmentItem
                  investment={investment}
                  onEdit={() => handleEdit(investment)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestmentList;
