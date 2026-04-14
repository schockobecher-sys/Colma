# Colma Collectoppr APP (iOS Native)

Dies ist eine native iOS App zur Verfolgung von Pokémon TCG Sammlungen (nur deutsche Produkte). Die Preise stammen direkt von Cardmarket.com.

## Features
- **Mobile-First Design**: Optimiert für iOS (iPhone) mit Tab-Bar und Dark Mode.
- **Echtzeit-Preise**: Live-Daten von Cardmarket (Sync alle 30 Min).
- **Deutsch Fokus**: Nur deutsche Karten und Produkte.
- **Native iOS Integration**: Nutzt Capacitor für native Performance.

## Entwickler-Anleitung

### Voraussetzungen
- Node.js & npm
- Xcode (für iOS Deployment)
- CocoaPods (`sudo gem install cocoapods`)

### Installation
1. `npm install`
2. `npx cap sync ios`

### App starten (Entwicklung)
1. `npm run dev` (Startet den Web-Server)

### App auf iOS Simulator/Gerät ausführen
1. `npm run build` (Erstellt die Web-Assets)
2. `npx cap sync ios` (Kopiert Assets in das iOS Projekt)
3. `npx cap open ios` (Öffnet das Projekt in Xcode)
4. In Xcode: Wähle dein Zielgerät und drücke den "Run" Button.

## Tech Stack
- React + Vite
- Capacitor (Native Bridge)
- Lucide React (Icons)
- Cardmarket S3 API (Preisdaten)
