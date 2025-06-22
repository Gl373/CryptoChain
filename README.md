# CryptoChain

CryptoChain är en fullständig implementation av en blockkedja för en egen kryptovaluta med transaktionshantering och validering. Systemet inkluderar en transaktionspool, nätverkssynkronisering mellan noder, MongoDB-lagring, och JWT-autentisering.

## Projektbeskrivning

Detta projekt är utvecklat som en slutlig inlämningsuppgift och implementerar en komplett blockkedja med följande huvudfunktioner:

- Transaktionshantering med validering
- Transaktionspool för hantering av väntande transaktioner
- Belöningstransaktioner vid blockgenerering
- Nätverkssynkronisering mellan noder
- MongoDB-lagring för blockkedja, block och transaktioner
- JWT-autentisering för säker åtkomst
- Frontend-klient för användarinteraktion

## Funktioner

### Backend
- **Transaktionshantering:** Skapa och validera transaktioner
- **Transaktionspool:** Hantera väntande transaktioner
- **Blockkedja:** Skapa och validera block med proof-of-work
- **Nätverkskommunikation:** Synkronisering mellan noder via Redis/Pubnub/Websockets
- **Databas:** MongoDB-lagring för persistent data
- **Autentisering:** JWT-baserad säkerhet och rollhantering

### Frontend
- **Användargränssnitt:** React/Vite eller ren JavaScript
- **Funktioner:**
  - Skapa nya transaktioner
  - Lista transaktioner
  - Lista block
  - Mining av block

## Teknisk struktur

### Backend
- **Models:** Block, Blockchain, Transaction, User
- **Controllers:** API-logik och validering
- **Routes:** API-endpoints
- **Middleware:** Autentisering, felhantering
- **Services:** Nätverkskommunikation, transaktionshantering
- **Database:** MongoDB-integration

### Frontend
- **Components:** React-komponenter eller JavaScript-moduler
- **Services:** API-integration
- **State Management:** Lokal state-hantering
- **UI/UX:** Responsiv design

## Installation och körning

### Förutsättningar

- Node.js (version 18 eller senare)
- npm (ingår i Node.js)
- MongoDB
- Redis/Pubnub (för nätverkskommunikation)

### Backend-installation

1. Klona repot och navigera till projektmappen:
   ```bash
   git clone [repository-url]
   cd cryptochain
   ```

2. Installera beroenden:
   ```bash
   npm install
   ```

3. Konfigurera miljövariabler:
   ```bash
   cp backend/config/.env.example backend/config/.env
   # Uppdatera .env med dina inställningar
   ```

4. Starta servern:
   ```bash
   npm run dev
   ```

### Frontend-installation

1. Navigera till frontend-mappen:
   ```bash
   cd frontend
   ```

2. Installera beroenden:
   ```bash
   npm install
   ```

3. Starta utvecklingsservern:
   ```bash
   npm run dev
   ```

## API-dokumentation

### Autentisering
```http
POST /api/auth/register
POST /api/auth/login
```

### Transaktioner
```http
POST /api/transactions
GET /api/transactions
GET /api/transactions/:id
```

### Block
```http
GET /api/blocks
GET /api/blocks/:hash
POST /api/blocks/mine
```

### Nätverk
```http
GET /api/network/peers
POST /api/network/connect
```

## Säkerhet

- JWT-autentisering för alla skyddade endpoints
- Rollbaserad åtkomstkontroll
- Validering av transaktioner
- Säker nätverkskommunikation

## Testning

Kör tester med:
```bash
npm test
```
