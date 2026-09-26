# RoomSync

Smart roommate management and coordination platform.

## Tech Stack

- **Frontend:** React, React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express, MongoDB Atlas, Mongoose, JWT

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account

### Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Start the server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Start the client:

```bash
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (protected)

### Households
- `POST /api/households` — Create a household (protected)
- `GET /api/households/my` — Get user's household (protected)
- `POST /api/households/join` — Join via invite code (protected)
- `POST /api/households/leave` — Leave household (protected)
- `DELETE /api/households/members/:userId` — Remove member (owner only)
- `POST /api/households/regenerate-invite` — Regenerate invite code (owner only)

### Health
- `GET /api/health` — API health check

## Project Structure

```
RoomSync/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/
│       ├── context/
│       └── utils/
├── server/          # Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
└── README.md
```
