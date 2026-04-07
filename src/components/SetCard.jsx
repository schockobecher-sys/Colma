import { Heart } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';

export default function SetCard({ set }) {
  const { toggleFavoriteSet, isFavoriteSet } = useCollection();
  const isFavorite = isFavoriteSet(set.id);

  return (
    <div className="set-card">
      <div className="set-header">
        <span className="set-symbol">{set.symbol}</span>
        <h3>{set.name}</h3>
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={() => toggleFavoriteSet(set.id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="set-info">
        <p>Total Cards: {set.totalCards}</p>
        <p>Release Date: {new Date(set.releaseDate).toLocaleDateString()}</p>
        <p className="set-description">{set.description}</p>
      </div>
    </div>
  );
}
