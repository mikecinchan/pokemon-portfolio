const { db } = require('../services/firebase');
const { getTokenPrice } = require('../services/dexscreener');

const investmentsCollection = db.collection('investments');

/**
 * Get all investments
 */
const getAllInvestments = async (req, res) => {
  try {
    const snapshot = await investmentsCollection.orderBy('createdAt', 'desc').get();
    const investments = [];

    snapshot.forEach((doc) => {
      investments.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      data: investments,
    });
  } catch (error) {
    console.error('Error getting investments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve investments',
    });
  }
};

/**
 * Get single investment by ID
 */
const getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await investmentsCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error('Error getting investment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve investment',
    });
  }
};

/**
 * Create new investment
 */
const createInvestment = async (req, res) => {
  try {
    const { tokenTicker, tokenAmount } = req.body;

    // Validation
    if (!tokenTicker || !tokenAmount) {
      return res.status(400).json({
        success: false,
        error: 'Token ticker and amount are required',
      });
    }

    if (tokenAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Token amount must be greater than 0',
      });
    }

    // Fetch current price from Dexscreener
    let tokenData;
    try {
      tokenData = await getTokenPrice(tokenTicker);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: `Unable to fetch price for ${tokenTicker}. Please check the ticker symbol.`,
      });
    }

    // Create investment document
    const investmentData = {
      tokenTicker: tokenTicker.toUpperCase(),
      tokenName: tokenData.name || tokenTicker,
      tokenAmount: parseFloat(tokenAmount),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await investmentsCollection.add(investmentData);

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...investmentData,
      },
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create investment',
    });
  }
};

/**
 * Update investment
 */
const updateInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const { tokenTicker, tokenAmount } = req.body;

    // Check if investment exists
    const doc = await investmentsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found',
      });
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (tokenAmount !== undefined) {
      if (tokenAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Token amount must be greater than 0',
        });
      }
      updateData.tokenAmount = parseFloat(tokenAmount);
    }

    if (tokenTicker !== undefined) {
      // Verify new ticker exists
      try {
        const tokenData = await getTokenPrice(tokenTicker);
        updateData.tokenTicker = tokenTicker.toUpperCase();
        updateData.tokenName = tokenData.name || tokenTicker;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: `Unable to fetch price for ${tokenTicker}. Please check the ticker symbol.`,
        });
      }
    }

    await investmentsCollection.doc(id).update(updateData);

    // Get updated document
    const updatedDoc = await investmentsCollection.doc(id).get();

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update investment',
    });
  }
};

/**
 * Delete investment
 */
const deleteInvestment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if investment exists
    const doc = await investmentsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found',
      });
    }

    await investmentsCollection.doc(id).delete();

    res.json({
      success: true,
      message: 'Investment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete investment',
    });
  }
};

module.exports = {
  getAllInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
};
