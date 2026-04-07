import { useState } from 'react';
import Card from '../components/Card';
import SearchBar from '../components/SearchBar';
import { pokemonCards, cardTypes } from '../data/pokemonCards';

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filteredCards = pokemonCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.set.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || card.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="cards-page">
      <div className="page-header">
        <h1>Card Database</h1>
        <p>Browse and discover Pokémon cards from all sets</p>
      </div>
      
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        cardTypes={cardTypes}
      />

      <div className="cards-grid">
        {filteredCards.length > 0 ? (
          filteredCards.map(card => (
            <Card key={card.id} card={card} />
          ))
        ) : (
          <div className="no-results">
            <p>No cards found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
