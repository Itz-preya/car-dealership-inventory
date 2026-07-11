# AutoInventory - Car Dealership Inventory System

A premium web application featuring robust user authentication, role-based access control (RBAC), advanced vehicle catalog search, and transaction-safe stock management.

---

## 🛠️ Technology Stack

### Backend
- **Core Framework**: Node.js with Express & TypeScript
- **Database integration**: Prisma ORM with SQLite database
- **Security & Signatures**: JWT authorization middleware & password encryption (bcryptjs)
- **CORS Handling**: Cross-Origin Resource Sharing enabled for secure frontend-backend communication
- **Unit Testing**: Jest & Supertest API mock validation suite

### Frontend
- **Core UI**: React with Vite & TypeScript
- **Styling**: Tailwind CSS v4 for responsive design
- **State Management**: Centralized `AuthContext` tracking user data, active JWT tokens, and login status
- **Routing**: React Router DOM with private guard boundaries
- **API integration**: Centralized Axios instance with request interceptors to auto-inject Bearer tokens
- **Design Assets**: Lucide React modern iconography

---

## 📂 Project Architecture

```text
├── backend/                  # Express REST API Server
│   ├── prisma/               # SQLite database schemas and dev migrations
│   ├── src/
│   │   ├── middleware/       # JWT extraction & RBAC verification helpers
│   │   ├── tests/            # TDD boundary unit tests (Auth, ASR, Vehicles)
│   │   ├── app.ts            # Route registrations & request controllers
│   │   └── index.ts          # Conditional listener entry point
│   └── package.json
│
└── frontend/                 # React SPA Client
    ├── src/
    │   ├── components/       # Layout components & responsive dashboards
    │   ├── context/          # React AuthContext session providers
    │   ├── pages/            # Login, Register, & Inventory catalog screens
    │   ├── services/         # Axios instance API integrations
    │   ├── App.tsx           # Private guard route configurations
    │   └── main.tsx          # Client entrypoint and wrapper registrations
    └── package.json
```

---

## 🚀 Getting Started

### 1. Backend Server Setup
Navigate to the `/backend` directory, install packages, apply migrations, and start the listener:
```bash
cd backend
npm install
npx prisma migrate dev
npm start
```
*Note: The backend server listens on `http://localhost:5000`.*

### 2. Frontend Client Setup
In a new terminal window, navigate to the `/frontend` directory, install packages, and launch the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
*Note: The frontend client hosts the dashboard at `http://localhost:5173`.*

---

## 🧪 Testing Suite
To execute all backend unit tests for registration endpoints, privilege checks, validation boundaries, and transactions:
```bash
cd backend
npm test
```

---

## 🔒 API Specifications Reference

### User Authentication
- `POST /api/auth/register` - Create user profile credentials (defaults to `'USER'`).
- `POST /api/auth/login` - Validate logins and return signed JWT session payloads.

### Vehicles Catalog Management
- `GET /api/vehicles` - Retrieve catalog records (supports status parameter filtering).
- `GET /api/vehicles/search` - Fetch filtered listings (supports `make`, `model`, `minPrice`, and `maxPrice`).
- `POST /api/vehicles` - Create a new catalog vehicle record (*Admin privileges required*).
- `PUT /api/vehicles/:id` - Update catalog vehicle parameters (*Admin privileges required*).
- `DELETE /api/vehicles/:id` - Delete catalog vehicle records (*Admin privileges required*).

### Stock Inventory Transactions
- `POST /api/vehicles/:id/purchase` - Decrement inventory stock by 1 (returns `400 Out of Stock` if quantity is 0).
- `POST /api/vehicles/:id/restock` - Increment inventory stock quantity by custom amount (*Admin privileges required*).
