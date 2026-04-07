import { useCollection } from '../context/CollectionContext';
import { pokemonCards, sets } from '../data/pokemonCards';
import Card from '../components/Card';
import SetCard from '../components/SetCard';

export default function FavoritesPage() {
  const { favorites } = useCollection();

  const favoriteCards = pokemonCards.filter(card => 
    favorites.cards.includes(card.id)
  );

  const favoriteSets = sets.filter(set => 
    favorites.sets.includes(set.id)
  );

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1>Favorites</h1>
        <p>Your favorite cards and sets</p>
      </div>

      {favoriteSets.length > 0 && (
        <section className="favorites-section">
          <h2>Favorite Sets</h2>
          <div className="sets-grid">
            {favoriteSets.map(set => (
              <SetCard key={set.id} set={set} />
            ))}
          </div>
        </section>
      )}

      {favoriteCards.length > 0 ? (
        <section className="favorites-section">
          <h2>Favorite Cards ({favoriteCards.length})</h2>
          <div className="cards-grid">
            {favoriteCards.map(card => (
              <Card key={card.id} card={card} />
            ))}
          </div>
        </section>
      ) : (
        <div className="empty-favorites">
          <h2>No favorite cards yet</h2>
          <p>Star cards to add them to your favorites!</p>
        </div>
      )}
    </div>
  );
}
