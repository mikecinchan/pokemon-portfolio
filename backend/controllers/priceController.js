const { getTokenPrice, getTokenPriceByAddress } = require('../services/dexscreener');

/**
 * Get token price by ticker symbol
 */
const getPriceByTicker = async (req, res) => {
  try {
    const { ticker } = req.params;

    if (!ticker) {
      return res.status(400).json({
        success: false,
        error: 'Token ticker is required',
      });
    }

    const tokenData = await getTokenPrice(ticker);

    res.json({
      success: true,
      data: tokenData,
    });
  } catch (error) {
    console.error('Error fetching token price:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Failed to fetch token price',
    });
  }
};

/**
 * Get token price by contract address
 */
const getPriceByAddress = async (req, res) => {
  try {
    const { chainId, address } = req.params;

    if (!chainId || !address) {
      return res.status(400).json({
        success: false,
        error: 'Chain ID and contract address are required',
      });
    }

    const tokenData = await getTokenPriceByAddress(chainId, address);

    res.json({
      success: true,
      data: tokenData,
    });
  } catch (error) {
    console.error('Error fetching token price by address:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Failed to fetch token price',
    });
  }
};

module.exports = {
  getPriceByTicker,
  getPriceByAddress,
};
