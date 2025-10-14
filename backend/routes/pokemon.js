const express = require('express');
const router = express.Router();
const {
  getAllPokemon,
  getPokemonForPortfolio,
  getPokemonByLevel,
  getPokemonById,
} = require('../controllers/pokemonController');

// @route   GET /api/pokemon
// @desc    Get all Pokemon sorted by weight
router.get('/', getAllPokemon);

// @route   GET /api/pokemon/for-portfolio?totalValue=100
// @desc    Get Pokemon for specific portfolio value
router.get('/for-portfolio', getPokemonForPortfolio);

// @route   GET /api/pokemon/level/:level
// @desc    Get Pokemon by level number
router.get('/level/:level', getPokemonByLevel);

// @route   GET /api/pokemon/:identifier
// @desc    Get Pokemon by name or ID
router.get('/:identifier', getPokemonById);

module.exports = router;
