import { useCollection } from '../context/CollectionContext';
import { pokemonCards } from '../data/pokemonCards';
import Card from '../components/Card';

export default function CollectionPage() {
  const { collection, getCollectionStats } = useCollection();

  const collectionCards = collection.map(item => {
    const card = pokemonCards.find(c => c.id === item.cardId);
    return card ? { ...card, quantity: item.quantity, condition: item.condition } : null;
  }).filter(Boolean);

  const stats = getCollectionStats();

  if (collection.length === 0) {
    return (
      <div className="collection-page">
        <div className="page-header">
          <h1>My Collection</h1>
          <p>Track your Pokémon card collection</p>
        </div>
        <div className="empty-collection">
          <h2>Your collection is empty</h2>
          <p>Start adding cards from the database to build your collection!</p>
          <a href="/cards" className="btn btn-primary">Browse Cards</a>
        </div>
      </div>
    );
  }

  return (
    <div className="collection-page">
      <div className="page-header">
        <h1>My Collection</h1>
        <p>Track your Pokémon card collection</p>
      </div>

      <div className="collection-stats">
        <div className="stat-card">
          <h3>{stats.uniqueCards}</h3>
          <p>Unique Cards</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalCards}</h3>
          <p>Total Cards</p>
        </div>
        <div className="stat-card">
          <h3>{stats.favoriteCards}</h3>
          <p>Favorites</p>
        </div>
      </div>

      <div className="cards-grid">
        {collectionCards.map(card => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
