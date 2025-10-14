const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 30 seconds
const priceCache = new NodeCache({ stdTTL: 30 });

const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest/dex';

/**
 * Search for a token by symbol and get its price
 * @param {string} tokenSymbol - Token symbol (e.g., 'BTC', 'ETH')
 * @returns {Promise<Object>} Token price data
 */
const getTokenPrice = async (tokenSymbol) => {
  try {
    // Check cache first
    const cached = priceCache.get(tokenSymbol);
    if (cached) {
      console.log(`Price for ${tokenSymbol} from cache:`, cached.price);
      return cached;
    }

    // Search for token - trying to find by symbol
    const searchUrl = `${DEXSCREENER_BASE_URL}/search?q=${tokenSymbol}`;
    const response = await axios.get(searchUrl);

    if (!response.data || !response.data.pairs || response.data.pairs.length === 0) {
      throw new Error(`Token ${tokenSymbol} not found`);
    }

    // Get the first pair (usually the most liquid)
    // Filter for pairs that match the symbol and sort by liquidity
    const matchingPairs = response.data.pairs.filter(pair =>
      pair.baseToken?.symbol?.toLowerCase() === tokenSymbol.toLowerCase()
    );

    if (matchingPairs.length === 0) {
      throw new Error(`No matching pairs found for ${tokenSymbol}`);
    }

    // Sort by liquidity and get the highest
    const bestPair = matchingPairs.sort((a, b) =>
      (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    )[0];

    const tokenData = {
      symbol: bestPair.baseToken.symbol,
      name: bestPair.baseToken.name,
      price: parseFloat(bestPair.priceUsd) || 0,
      priceChange24h: parseFloat(bestPair.priceChange?.h24) || 0,
      liquidity: bestPair.liquidity?.usd || 0,
      pairAddress: bestPair.pairAddress,
      chainId: bestPair.chainId,
      dexId: bestPair.dexId,
    };

    // Cache the result
    priceCache.set(tokenSymbol, tokenData);
    console.log(`Price for ${tokenSymbol}:`, tokenData.price);

    return tokenData;
  } catch (error) {
    console.error(`Error fetching price for ${tokenSymbol}:`, error.message);

    // Check if we have cached data (even expired)
    const cached = priceCache.get(tokenSymbol);
    if (cached) {
      console.log('Returning expired cached data');
      return cached;
    }

    throw new Error(`Unable to fetch price for ${tokenSymbol}: ${error.message}`);
  }
};

/**
 * Get token price by contract address
 * @param {string} chainId - Blockchain chain ID (e.g., 'ethereum', 'bsc')
 * @param {string} address - Token contract address
 * @returns {Promise<Object>} Token price data
 */
const getTokenPriceByAddress = async (chainId, address) => {
  try {
    const cacheKey = `${chainId}:${address}`;
    const cached = priceCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const url = `${DEXSCREENER_BASE_URL}/tokens/${address}`;
    const response = await axios.get(url);

    if (!response.data || !response.data.pairs || response.data.pairs.length === 0) {
      throw new Error(`Token not found at address ${address}`);
    }

    const bestPair = response.data.pairs[0];
    const tokenData = {
      symbol: bestPair.baseToken.symbol,
      name: bestPair.baseToken.name,
      price: parseFloat(bestPair.priceUsd) || 0,
      priceChange24h: parseFloat(bestPair.priceChange?.h24) || 0,
      liquidity: bestPair.liquidity?.usd || 0,
      pairAddress: bestPair.pairAddress,
      chainId: bestPair.chainId,
      dexId: bestPair.dexId,
    };

    priceCache.set(cacheKey, tokenData);
    return tokenData;
  } catch (error) {
    console.error(`Error fetching price by address:`, error.message);
    throw new Error(`Unable to fetch token price: ${error.message}`);
  }
};

module.exports = {
  getTokenPrice,
  getTokenPriceByAddress,
};
