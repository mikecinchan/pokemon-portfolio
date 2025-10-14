const { getAllPokemonSortedByWeight, getPokemonForLevel, getPokemon } = require('../services/pokeapi');
const { getLevelInfo } = require('../utils/pokemonLevel');

/**
 * Get all Pokemon sorted by weight
 */
const getAllPokemon = async (req, res) => {
  try {
    const pokemon = await getAllPokemonSortedByWeight();

    res.json({
      success: true,
      count: pokemon.length,
      data: pokemon,
    });
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Pokemon data',
    });
  }
};

/**
 * Get Pokemon for a specific portfolio value
 */
const getPokemonForPortfolio = async (req, res) => {
  try {
    const { totalValue } = req.query;

    if (!totalValue || isNaN(totalValue)) {
      return res.status(400).json({
        success: false,
        error: 'Total portfolio value is required and must be a number',
      });
    }

    const value = parseFloat(totalValue);
    const levelInfo = getLevelInfo(value);
    const pokemon = await getPokemonForLevel(levelInfo.level);

    res.json({
      success: true,
      data: {
        pokemon,
        levelInfo,
      },
    });
  } catch (error) {
    console.error('Error getting Pokemon for portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Pokemon for portfolio value',
    });
  }
};

/**
 * Get Pokemon by level number
 */
const getPokemonByLevel = async (req, res) => {
  try {
    const { level } = req.params;

    if (level === undefined || isNaN(level)) {
      return res.status(400).json({
        success: false,
        error: 'Level must be a valid number',
      });
    }

    const pokemon = await getPokemonForLevel(parseInt(level));

    res.json({
      success: true,
      data: pokemon,
    });
  } catch (error) {
    console.error('Error getting Pokemon by level:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Pokemon for level',
    });
  }
};

/**
 * Get specific Pokemon by name or ID
 */
const getPokemonById = async (req, res) => {
  try {
    const { identifier } = req.params;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'Pokemon name or ID is required',
      });
    }

    const pokemon = await getPokemon(identifier);

    res.json({
      success: true,
      data: pokemon,
    });
  } catch (error) {
    console.error('Error getting Pokemon:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Pokemon not found',
    });
  }
};

module.exports = {
  getAllPokemon,
  getPokemonForPortfolio,
  getPokemonByLevel,
  getPokemonById,
};
