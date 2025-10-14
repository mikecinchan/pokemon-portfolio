const express = require('express');
const router = express.Router();
const {
  getAllInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} = require('../controllers/investmentController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// @route   GET /api/investments
// @desc    Get all investments
router.get('/', getAllInvestments);

// @route   GET /api/investments/:id
// @desc    Get investment by ID
router.get('/:id', getInvestmentById);

// @route   POST /api/investments
// @desc    Create new investment
router.post('/', createInvestment);

// @route   PUT /api/investments/:id
// @desc    Update investment
router.put('/:id', updateInvestment);

// @route   DELETE /api/investments/:id
// @desc    Delete investment
router.delete('/:id', deleteInvestment);

module.exports = router;
