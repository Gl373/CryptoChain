# CryptoChain

CryptoChain är en fullständig implementation av en blockkedja för en egen kryptovaluta med transaktionshantering, validering och nätverkssynkronisering via WebSocket. Systemet inkluderar en transaktionspool, MongoDB-lagring och JWT-autentisering. Frontend är byggd i React/Vite.

## Projektbeskrivning

Detta projekt är utvecklat som en slutlig inlämningsuppgift och implementerar en komplett blockkedja med:
- Transaktionshantering och validering
- Transaktionspool för väntande transaktioner
- Belöningstransaktioner vid mining
- Nätverkssynkronisering mellan noder via WebSocket
- MongoDB-lagring för blockkedja, block, transaktioner och användare
- JWT-autentisering för säker åtkomst
- Frontend-klient (React/Vite) för användarinteraktion

## Funktioner

### Backend
- Skapa och validera transaktioner
- Hantera väntande transaktioner i transaktionspool
- Skapa och validera block med proof-of-work
- Synkronisering mellan noder via WebSocket
- MongoDB-lagring (databas: `CryptoChain` eller enligt .env)
- JWT-baserad autentisering och rollhantering

### Frontend
- Byggd i React/Vite
- Skapa nya transaktioner
- Lista transaktioner (transaktionspool)
- Lista block (blockkedjan)
- Mine:a block (lägg till transaktioner i kedjan)
- Logga in/registrera användare

## Teknisk struktur

### Backend
- **Models:** Block, Blockchain, Transaction, User
- **Controllers:** API-logik och validering
- **Routes:** API-endpoints
- **Middleware:** Autentisering, felhantering
- **Network:** WebSocket-baserad synkronisering
- **Database:** MongoDB-integration

### Frontend
- **Components:** React-komponenter
- **Services:** API-integration
- **State Management:** Lokal state-hantering
- **UI/UX:** Responsiv design

## Installation och körning

### Förutsättningar
- Node.js (version 18 eller senare)
- npm (ingår i Node.js)
- MongoDB

### Backend-installation
1. Klona repot och navigera till projektmappen:
   ```bash
   git clone https://github.com/Gl373/CryptoChain
   cd CryptoChain
   ```
2. Installera beroenden:
   ```bash
   npm install
   ```
3. Konfigurera miljövariabler:
   ```bash
   cp backend/config/.env.example backend/config/.env
   # Uppdatera .env 
   ```
4. Starta en nod:
   ```bash
   npm run dev
   ```

#### Starta flera noder (exempel):
```bash
# Nod 1
PORT=3000 SOCKET_PORT=5001 npm start
# Nod 2
PORT=3001 SOCKET_PORT=5002 NODES=localhost:5001 npm start
# Nod 3
PORT=3002 SOCKET_PORT=5003 NODES=localhost:5001,localhost:5002 npm start
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
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Transaktioner
```http
POST /api/v1/transactions
GET /api/v1/transactions
```

### Block
```http
GET /api/v1/blocks
POST /api/v1/blocks/mining
```

## Viktigt om transaktionspool och mining
- Transaktionspoolen visar väntande transaktioner.
- När du minar ett block (POST /api/v1/blocks/mining) läggs alla väntande transaktioner in i blocket och poolen töms.
- Transaktionerna finns då i blockkedjan (GET /api/v1/blocks).

## Säkerhet
- JWT-autentisering för alla skyddade endpoints
- Rollbaserad åtkomstkontroll
- Validering av transaktioner

## Testning och TDD
- Tester för transaktionshantering och validering finns i `backend/src/tests/`
- Kör tester med:
  ```bash
  npm test
  ```

## Felsökningstips
- Om du får 401 Unauthorized: Kontrollera att du skickar JWT-token i Authorization-headern.

