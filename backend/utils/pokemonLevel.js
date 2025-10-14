/**
 * Calculate the portfolio level based on total value
 * Starting at $100 with 1.5x multiplier
 * @param {number} totalValue - Total portfolio value in USD
 * @returns {number} - Level number (0-based index)
 */
function calculateLevel(totalValue) {
  if (totalValue < 100) return 0; // Below minimum threshold

  let level = 0;
  let threshold = 100;

  while (totalValue >= threshold) {
    level++;
    threshold = threshold * 1.5;
  }

  return level;
}

/**
 * Get the threshold value for a specific level
 * @param {number} level - Level number
 * @returns {number} - Threshold value in USD
 */
function getLevelThreshold(level) {
  if (level === 0) return 0;
  if (level === 1) return 100;
  return 100 * Math.pow(1.5, level - 1);
}

/**
 * Get next level threshold
 * @param {number} currentLevel - Current level
 * @returns {number} - Next level threshold
 */
function getNextThreshold(currentLevel) {
  return getLevelThreshold(currentLevel + 1);
}

/**
 * Calculate progress to next level (0-100)
 * @param {number} totalValue - Current portfolio value
 * @param {number} currentLevel - Current level
 * @returns {number} - Progress percentage
 */
function calculateProgress(totalValue, currentLevel) {
  const currentThreshold = getLevelThreshold(currentLevel);
  const nextThreshold = getNextThreshold(currentLevel);

  // Handle edge cases
  if (nextThreshold === currentThreshold) return 0;
  if (totalValue < currentThreshold) return 0;

  const progress = ((totalValue - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Get level information for a given portfolio value
 * @param {number} totalValue - Total portfolio value
 * @returns {Object} - Level information
 */
function getLevelInfo(totalValue) {
  const level = calculateLevel(totalValue);
  const currentThreshold = getLevelThreshold(level);
  const nextThreshold = getNextThreshold(level);
  const progress = calculateProgress(totalValue, level);

  return {
    level,
    currentThreshold,
    nextThreshold,
    progress,
    totalValue,
  };
}

module.exports = {
  calculateLevel,
  getLevelThreshold,
  getNextThreshold,
  calculateProgress,
  getLevelInfo,
};
