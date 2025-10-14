const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 24 hours (86400 seconds)
const pokemonCache = new NodeCache({ stdTTL: 86400 });

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Fetch all Pokemon and sort by weight
 * @returns {Promise<Array>} Sorted array of Pokemon
 */
const getAllPokemonSortedByWeight = async () => {
  try {
    // Check cache first
    const cached = pokemonCache.get('all_pokemon_sorted');
    if (cached) {
      console.log('Returning cached Pokemon data');
      return cached;
    }

    console.log('Fetching Pokemon data from API...');

    // Get list of all Pokemon (limit to first 151 for performance, can be increased)
    const listResponse = await axios.get(`${POKEAPI_BASE_URL}/pokemon?limit=151`);
    const pokemonList = listResponse.data.results;

    // Fetch detailed data for each Pokemon (including weight)
    const pokemonDataPromises = pokemonList.map(async (pokemon) => {
      const response = await axios.get(pokemon.url);
      return {
        id: response.data.id,
        name: response.data.name,
        weight: response.data.weight, // Weight in hectograms
        sprite: response.data.sprites.other['official-artwork'].front_default ||
                response.data.sprites.front_default,
        types: response.data.types.map(t => t.type.name),
      };
    });

    const allPokemon = await Promise.all(pokemonDataPromises);

    // Sort by weight (ascending - lightest to heaviest)
    const sortedPokemon = allPokemon.sort((a, b) => a.weight - b.weight);

    // Cache the result
    pokemonCache.set('all_pokemon_sorted', sortedPokemon);
    console.log(`Fetched and sorted ${sortedPokemon.length} Pokemon`);

    return sortedPokemon;
  } catch (error) {
    console.error('Error fetching Pokemon data:', error.message);
    throw new Error('Unable to fetch Pokemon data');
  }
};

/**
 * Get Pokemon for a specific level
 * @param {number} level - Portfolio level
 * @returns {Promise<Object>} Pokemon data
 */
const getPokemonForLevel = async (level) => {
  try {
    const allPokemon = await getAllPokemonSortedByWeight();

    // If level is 0 or negative, return the lightest Pokemon
    if (level <= 0) {
      return allPokemon[0];
    }

    // If level exceeds Pokemon count, return the heaviest
    const index = Math.min(level, allPokemon.length - 1);

    return allPokemon[index];
  } catch (error) {
    console.error('Error getting Pokemon for level:', error.message);
    throw error;
  }
};

/**
 * Get a specific Pokemon by name or ID
 * @param {string|number} identifier - Pokemon name or ID
 * @returns {Promise<Object>} Pokemon data
 */
const getPokemon = async (identifier) => {
  try {
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${identifier}`);
    return {
      id: response.data.id,
      name: response.data.name,
      weight: response.data.weight,
      sprite: response.data.sprites.other['official-artwork'].front_default ||
              response.data.sprites.front_default,
      types: response.data.types.map(t => t.type.name),
    };
  } catch (error) {
    console.error(`Error fetching Pokemon ${identifier}:`, error.message);
    throw new Error(`Pokemon ${identifier} not found`);
  }
};

module.exports = {
  getAllPokemonSortedByWeight,
  getPokemonForLevel,
  getPokemon,
};
