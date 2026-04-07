import { Search, Filter } from 'lucide-react';

export default function SearchBar({ searchTerm, onSearchChange, selectedType, onTypeChange, cardTypes }) {
  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search Pokémon cards..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="filter-wrapper">
        <Filter size={20} className="filter-icon" />
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="type-filter"
        >
          <option value="">All Types</option>
          {cardTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
