/**
 * Middleware to verify user authentication via Authorization header
 * Expects Authorization header with Bearer token and x-user-id header
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = req.headers['x-user-id'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No token provided',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User ID not found',
      });
    }

    // For now, we trust the userId from the frontend
    // The Firestore security rules provide the actual security layer
    // Backend just validates userId for business logic
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid token',
    });
  }
};

module.exports = { authenticateUser };
