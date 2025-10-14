import { formatCurrency } from '../utils/formatting';
import './PokemonEmblem.css';

const PokemonEmblem = ({ pokemon, levelInfo, totalValue }) => {
  if (!levelInfo) return null;

  const { level, nextThreshold, progress } = levelInfo;

  return (
    <div className="pokemon-emblem">
      <div className="emblem-container">
        {totalValue >= 100 && pokemon ? (
          <>
            <div className="pokemon-image-wrapper">
              <img
                src={pokemon.sprite}
                alt={pokemon.name}
                className="pokemon-image"
              />
              <div className="pokemon-glow"></div>
            </div>
            <h2 className="pokemon-name">{pokemon.name.toUpperCase()}</h2>
            <div className="pokemon-types">
              {pokemon.types.map((type) => (
                <span key={type} className={`type-badge ${type}`}>
                  {type}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="locked-emblem">
            <div className="pokeball-icon">?</div>
            <p className="locked-text">Reach $100 to unlock your Pokemon!</p>
          </div>
        )}
      </div>

      <div className="level-info">
        <div className="level-header">
          <span className="level-label">Investment Level</span>
          <span className="level-value">{level}</span>
        </div>

        <div className="portfolio-value">
          <span className="value-label">Total Portfolio</span>
          <span className="value-amount">{formatCurrency(totalValue)}</span>
        </div>

        {totalValue >= 100 && (
          <>
            <div className="next-level">
              <span className="next-label">Next Level</span>
              <span className="next-value">{formatCurrency(nextThreshold)}</span>
            </div>

            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{progress.toFixed(1)}%</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PokemonEmblem;
