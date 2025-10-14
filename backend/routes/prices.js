const express = require('express');
const router = express.Router();
const { getPriceByTicker, getPriceByAddress } = require('../controllers/priceController');

// @route   GET /api/prices/:ticker
// @desc    Get token price by ticker symbol
router.get('/:ticker', getPriceByTicker);

// @route   GET /api/prices/:chainId/:address
// @desc    Get token price by contract address
router.get('/:chainId/:address', getPriceByAddress);

module.exports = router;
