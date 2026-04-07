import { Star, StarOff } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';

export default function Card({ card }) {
  const { 
    addToCollection, 
    removeFromCollection, 
    isInCollection, 
    toggleFavoriteCard, 
    isFavoriteCard 
  } = useCollection();

  const inCollection = isInCollection(card.id);
  const isFavorite = isFavoriteCard(card.id);

  return (
    <div className="card">
      <div className="card-image">
        <img src={card.image} alt={card.name} />
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={() => toggleFavoriteCard(card.id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? <StarOff size={20} /> : <Star size={20} />}
        </button>
      </div>
      <div className="card-info">
        <h3>{card.name}</h3>
        <p className="card-set">{card.set}</p>
        <p className="card-number">{card.number}</p>
        <div className="card-details">
          <span className={`type type-${card.type.toLowerCase()}`}>{card.type}</span>
          <span className="rarity">{card.rarity}</span>
        </div>
        <div className="card-stats">
          <span>HP: {card.hp}</span>
          <span>Stage: {card.stage}</span>
        </div>
        <div className="card-price">
          <span className="price-label">Market Price:</span>
          <span className="price-value">${card.prices.market.toFixed(2)}</span>
        </div>
        <div className="card-actions">
          {!inCollection ? (
            <button 
              className="btn btn-primary"
              onClick={() => addToCollection(card.id)}
            >
              Add to Collection
            </button>
          ) : (
            <button 
              className="btn btn-secondary"
              onClick={() => removeFromCollection(card.id)}
            >
              Remove from Collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
