import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import './InvestmentForm.css';

const InvestmentForm = ({ editData = null, onCancel = null }) => {
  const { addInvestment, updateInvestment, loading } = usePortfolio();
  const [formData, setFormData] = useState({
    tokenTicker: editData?.tokenTicker || '',
    tokenAmount: editData?.tokenAmount || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.tokenTicker.trim()) {
      setError('Please enter a token ticker');
      return;
    }

    if (!formData.tokenAmount || parseFloat(formData.tokenAmount) <= 0) {
      setError('Please enter a valid token amount');
      return;
    }

    try {
      if (editData) {
        // Update existing investment
        await updateInvestment(editData.id, {
          tokenTicker: formData.tokenTicker.toUpperCase(),
          tokenAmount: parseFloat(formData.tokenAmount),
        });
        setSuccess('Investment updated successfully!');
        if (onCancel) {
          setTimeout(() => onCancel(), 1500);
        }
      } else {
        // Add new investment
        await addInvestment({
          tokenTicker: formData.tokenTicker.toUpperCase(),
          tokenAmount: parseFloat(formData.tokenAmount),
        });
        setSuccess('Investment added successfully!');
        // Reset form
        setFormData({
          tokenTicker: '',
          tokenAmount: '',
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="investment-form-container">
      <h3>{editData ? 'Edit Investment' : 'Add New Investment'}</h3>
      <form onSubmit={handleSubmit} className="investment-form">
        <div className="form-group">
          <label htmlFor="tokenTicker">Token Ticker</label>
          <input
            type="text"
            id="tokenTicker"
            name="tokenTicker"
            value={formData.tokenTicker}
            onChange={handleChange}
            placeholder="e.g., BTC, ETH, SOL"
            disabled={loading}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tokenAmount">Amount</label>
          <input
            type="number"
            id="tokenAmount"
            name="tokenAmount"
            value={formData.tokenAmount}
            onChange={handleChange}
            placeholder="0.00"
            step="any"
            min="0"
            disabled={loading}
            className="form-input"
          />
        </div>

        {error && <div className="message error-message">{error}</div>}
        {success && <div className="message success-message">{success}</div>}

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Processing...' : editData ? 'Update' : 'Add Investment'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default InvestmentForm;
