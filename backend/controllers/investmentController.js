const { db } = require('../services/firebase');
const { getTokenPrice } = require('../services/dexscreener');

/**
 * Get all investments for the authenticated user
 */
const getAllInvestments = async (req, res) => {
  try {
    const userId = req.userId;

    const snapshot = await db
      .collection('investments')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

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
    const userId = req.userId;

    const doc = await db.collection('investments').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found',
      });
    }

    const data = doc.data();
    // Verify ownership
    if (data.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
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

    // Create investment document with userId
    const investmentData = {
      userId: req.userId,
      tokenTicker: tokenTicker.toUpperCase(),
      tokenName: tokenData.name || tokenTicker,
      tokenAmount: parseFloat(tokenAmount),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('investments').add(investmentData);

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
    const userId = req.userId;

    const docRef = db.collection('investments').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found',
      });
    }

    const docData = doc.data();
    // Verify ownership
    if (docData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
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

    await docRef.update(updateData);

    // Get updated document
    const updatedDoc = await docRef.get();

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
    const userId = req.userId;

    const docRef = db.collection('investments').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found',
      });
    }

    const docData = doc.data();
    // Verify ownership
    if (docData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    await docRef.delete();

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
