# Colma - Pokémon Card Collection Tracker

An extensive Pokémon card database and collection tracker built with React and Vite.

## Features

- 🃏 **Extensive Card Database**: Browse Pokémon cards from all sets with detailed information
- 📚 **Collection Management**: Add cards to your personal collection and track quantities and conditions
- ⭐ **Favorites System**: Mark your favorite cards and sets for quick access
- 💰 **Market Prices**: Track current market prices and monitor your collection's value
- 🔍 **Advanced Search**: Filter cards by name, set, and type
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌓 **Dark Mode Support**: Automatic dark mode based on system preferences
- 💾 **Local Storage**: Your collection data is saved locally in your browser

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Styling**: CSS3 with modern features

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd colma
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
colma/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Card.jsx      # Individual card display component
│   │   ├── SetCard.jsx   # Set display component
│   │   ├── SearchBar.jsx # Search and filter component
│   │   └── Navbar.jsx    # Navigation bar component
│   ├── context/          # React context providers
│   │   └── CollectionContext.jsx  # Collection state management
│   ├── data/             # Sample data and constants
│   │   └── pokemonCards.js        # Card and set data
│   ├── pages/            # Page components
│   │   ├── HomePage.jsx           # Landing page
│   │   ├── CardsPage.jsx          # Card database browser
│   │   ├── CollectionPage.jsx     # User's collection view
│   │   └── FavoritesPage.jsx      # Favorite cards and sets
│   ├── App.jsx           # Main app component with routing
│   ├── App.css           # Global styles
│   ├── index.css         # Base styles
│   └── main.jsx          # Application entry point
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Project dependencies
└── vite.config.js        # Vite configuration
```

## Usage

### Browsing Cards

1. Navigate to the "Cards" page
2. Use the search bar to find specific cards
3. Filter cards by type using the dropdown
4. Click "Add to Collection" to add a card to your collection

### Managing Your Collection

1. Navigate to the "Collection" page
2. View all cards you've added
3. See statistics about your collection
4. Remove cards from your collection

### Using Favorites

1. Click the star icon on any card to mark it as favorite
2. Navigate to the "Favorites" page to see all favorited cards and sets
3. Click the star again to remove from favorites

## Data

This project includes sample Pokémon card data for demonstration purposes. In a production environment, you would typically fetch this data from a Pokémon TCG API such as:

- [Pokémon TCG API](https://pokemontcg.io/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Pokémon TCG data provided by [Pokémon TCG API](https://pokemontcg.io/)
- Icons by [Lucide](https://lucide.dev/)
- Built with [Vite](https://vitejs.dev/) and [React](https://react.dev/)
