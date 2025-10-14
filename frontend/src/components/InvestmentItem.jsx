import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency } from '../utils/formatting';
import './InvestmentItem.css';

const InvestmentItem = ({ investment, onEdit }) => {
  const { deleteInvestment } = usePortfolio();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteInvestment(investment.id);
    } catch (error) {
      console.error('Error deleting investment:', error);
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const currentPrice = investment.currentPrice || 0;
  const holdings = investment.holdings || (investment.tokenAmount * currentPrice);

  return (
    <div className="investment-item">
      <div className="investment-main">
        <div className="investment-info">
          <div className="token-header">
            <span className="token-ticker">{investment.tokenTicker}</span>
            {investment.tokenName && (
              <span className="token-name">{investment.tokenName}</span>
            )}
          </div>
          <div className="investment-details">
            <span className="detail-item">
              Amount: <strong>{investment.tokenAmount}</strong>
            </span>
            {currentPrice > 0 && (
              <>
                <span className="detail-separator">|</span>
                <span className="detail-item">
                  Price: <strong>{formatCurrency(currentPrice)}</strong>
                </span>
              </>
            )}
          </div>
        </div>
        <div className="investment-value">
          <span className="value-label">Holdings</span>
          <span className="value-amount">{formatCurrency(holdings)}</span>
        </div>
      </div>

      {showConfirm ? (
        <div className="confirm-delete">
          <p>Are you sure you want to delete this investment?</p>
          <div className="confirm-actions">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-danger-confirm"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={cancelDelete}
              disabled={deleting}
              className="btn btn-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="investment-actions">
          <button
            onClick={onEdit}
            className="btn btn-edit"
            title="Edit investment"
          >
            ✏️ Edit
          </button>
          <button
            onClick={confirmDelete}
            className="btn btn-danger"
            title="Delete investment"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default InvestmentItem;
