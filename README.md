# SkillSwap

A MERN (MongoDB, Express, React, Node.js) based application for skill exchange and learning.

## Project Structure

```
skillswap/
├── backend/          # Node.js/Express server
│   ├── config/       # Database and JWT configuration
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Express middleware
│   ├── server.js     # Main server file
│   └── package.json
│
├── frontend/         # React application
│   ├── public/       # Static files
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # Reusable components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js v14+
- MongoDB
- npm or yarn

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```

## Features
- User authentication and registration
- Skill listing and management
- Skill swap requests and processing
- User reviews and ratings
- Leaderboard system
- User dashboard

## License
MIT
