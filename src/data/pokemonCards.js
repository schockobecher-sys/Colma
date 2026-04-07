// Sample Pokémon TCG Card Database
export const pokemonCards = [
  {
    id: "base1-4",
    name: "Charizard",
    set: "Base Set",
    setId: "base1",
    number: "4/102",
    rarity: "Rare Holo",
    type: "Fire",
    hp: 120,
    stage: "Stage 2",
    evolvesFrom: "Charmeleon",
    artist: "Mitsuhiro Arita",
    releaseDate: "1999-01-09",
    prices: {
      low: 150.00,
      mid: 350.00,
      high: 5000.00,
      market: 400.00
    },
    image: "https://images.pokemontcg.io/base1/4_hires.png",
    description: "Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally."
  },
  {
    id: "base1-1",
    name: "Alakazam",
    set: "Base Set",
    setId: "base1",
    number: "1/102",
    rarity: "Rare Holo",
    type: "Psychic",
    hp: 80,
    stage: "Stage 2",
    evolvesFrom: "Kadabra",
    artist: "Ken Sugimori",
    releaseDate: "1999-01-09",
    prices: {
      low: 20.00,
      mid: 45.00,
      high: 150.00,
      market: 50.00
    },
    image: "https://images.pokemontcg.io/base1/1_hires.png",
    description: "Its brain can outperform a supercomputer. Its intelligence quotient is said to be 5,000."
  },
  {
    id: "base1-2",
    name: "Blastoise",
    set: "Base Set",
    setId: "base1",
    number: "2/102",
    rarity: "Rare Holo",
    type: "Water",
    hp: 100,
    stage: "Stage 2",
    evolvesFrom: "Wartortle",
    artist: "Ken Sugimori",
    releaseDate: "1999-01-09",
    prices: {
      low: 100.00,
      mid: 250.00,
      high: 3000.00,
      market: 275.00
    },
    image: "https://images.pokemontcg.io/base1/2_hires.png",
    description: "A brutal Pokémon with pressurized water jets on its shell. They are used for high speed tackles."
  },
  {
    id: "base1-15",
    name: "Pikachu",
    set: "Base Set",
    setId: "base1",
    number: "58/102",
    rarity: "Common",
    type: "Lightning",
    hp: 40,
    stage: "Basic",
    evolvesFrom: null,
    artist: "Mitsuhiro Arita",
    releaseDate: "1999-01-09",
    prices: {
      low: 5.00,
      mid: 15.00,
      high: 100.00,
      market: 20.00
    },
    image: "https://images.pokemontcg.io/base1/58_hires.png",
    description: "When several of these Pokémon gather, their electricity could build and cause lightning storms."
  },
  {
    id: "base1-16",
    name: "Raichu",
    set: "Base Set",
    setId: "base1",
    number: "14/102",
    rarity: "Rare Holo",
    type: "Lightning",
    hp: 80,
    stage: "Stage 1",
    evolvesFrom: "Pikachu",
    artist: "Ken Sugimori",
    releaseDate: "1999-01-09",
    prices: {
      low: 25.00,
      mid: 60.00,
      high: 200.00,
      market: 70.00
    },
    image: "https://images.pokemontcg.io/base1/14_hires.png",
    description: "Its long tail serves as a ground to protect itself from its own high voltage power."
  }
];

export const sets = [
  {
    id: "base1",
    name: "Base Set",
    totalCards: 102,
    releaseDate: "1999-01-09",
    symbol: "🎴",
    description: "The original Pokémon Trading Card Game set released in English."
  },
  {
    id: "jungle",
    name: "Jungle",
    totalCards: 64,
    releaseDate: "1999-06-16",
    symbol: "🌿",
    description: "The first expansion set featuring Pokémon from the jungle."
  },
  {
    id: "fossil",
    name: "Fossil",
    totalCards: 62,
    releaseDate: "1999-10-10",
    symbol: "🦕",
    description: "Ancient Pokémon return in this prehistoric expansion."
  }
];

export const cardTypes = [
  "Grass",
  "Fire",
  "Water",
  "Lightning",
  "Psychic",
  "Fighting",
  "Darkness",
  "Metal",
  "Dragon",
  "Colorless"
];

export const rarities = [
  "Common",
  "Uncommon",
  "Rare",
  "Rare Holo",
  "Ultra Rare",
  "Secret Rare"
];
