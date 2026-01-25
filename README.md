# BioScout 🌿🦋

> An intelligent biodiversity observation and species identification platform for Islamabad, Pakistan.

## Overview

BioScout is a full-stack web application that combines species identification, biodiversity observation mapping, and an AI-powered knowledge base to help users explore and document local wildlife. The platform leverages the iNaturalist API for species identification, PostgreSQL for data persistence, and RAG (Retrieval-Augmented Generation) for intelligent query responses.

---

## ✨ Features

### 🔍 Species Identification

- Upload images of plants, animals, or insects
- AI-powered species identification using iNaturalist Computer Vision API
- Detailed species information including common names, scientific names, and Wikipedia links
- Confidence scoring for identification accuracy

### 🗺️ Interactive Observation Map

- View biodiversity observations on an interactive Leaflet map
- Filter observations by category (Plants, Animals, All)
- Search observations by species name
- Click markers to view detailed observation information
- Visualize observation density and geographic distribution

### 💬 AI-Powered Chat Interface

- Ask questions about local biodiversity
- RAG-based knowledge retrieval from curated biodiversity data
- Context-aware responses using LlamaIndex
- Persistent chat history stored in PostgreSQL
- Multi-conversation support

### 👤 User Authentication

- Secure user registration and login
- JWT-based authentication with 30-day token expiry
- Password hashing with bcrypt
- Google OAuth integration (optional)
- User-specific data isolation

### 📊 Data Management

- Store and retrieve biodiversity observations
- CSV-based data import/export
- User-specific observation tracking
- Automatic timestamp management

---

## 🏗️ Architecture

### Backend (Flask)

- **Framework**: Flask with Python 3.12+
- **Database**: PostgreSQL
- **Authentication**: JWT tokens with Flask-JWT-Extended
- **APIs**:
  - iNaturalist Computer Vision API
  - OpenAI API (for embeddings)
- **RAG Engine**: LlamaIndex with vector embeddings
- **Image Processing**: PIL/Pillow

### Frontend (React)

- **Framework**: React 18 with Vite
- **UI Library**: Custom CSS components
- **Mapping**: Leaflet.js
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router v6

---

## 📁 Project Structure

```
BioScout-main/
├── bioscout-backend/             # Flask Backend
│   ├── app.py                    # Main Flask application
│   ├── config.py                 # Configuration (API keys, DB settings)
│   ├── models/                   # Database models
│   │   ├── user.py
│   │   ├── observation.py
│   │   └── knowledge_base.py
│   ├── routes/                   # API route handlers
│   │   ├── auth_routes.py        # Authentication endpoints
│   │   ├── chat_routes.py        # Chat/conversation endpoints
│   │   ├── identify_routes.py    # Species identification
│   │   ├── observation_routes.py # Observation CRUD
│   │   └── query_routes.py       # RAG query endpoints
│   ├── services/                 # Business logic
│   │   ├── ai_service.py         # OpenAI integration
│   │   ├── inaturalist_service.py # iNaturalist API
│   │   ├── rag_service.py        # RAG implementation
│   │   └── species_identification_service.py
│   ├── data/                     # Data storage
│   │   ├── animals_observations.csv
│   │   ├── plants_observations.csv
│   │   ├── users.csv
│   │   └── knowledge_files/      # RAG knowledge base
│   ├── static/                   # Static assets
│   └── templates/                # HTML templates
│
├── bioscout-frontend/           # React Frontend
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── pages/               # Page components
│   │   │   ├── HomePage.jsx     # Map view
│   │   │   ├── ChatPage.jsx     # Chat interface
│   │   │   ├── LoginPage.jsx    # Authentication
│   │   │   └── SignupPage.jsx
│   │   ├── components/          # Reusable components
│   │   │   ├── MapView.jsx      # Leaflet map
│   │   │   ├── QueryPanel.jsx   # Chat/query interface
│   │   │   ├── FilterPanel.jsx  # Observation filters
│   │   │   └── Header.jsx       # Navigation header
│   │   ├── context/             # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ChatHistoryContext.jsx
│   │   └── services/
│   │       └── api.js           # Axios API client
│   ├── package.json
│   └── vite.config.js
│
└── api.py                       # Standalone CLI species identifier

```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- API Keys:
  - OpenAI API key
  - iNaturalist account (optional, API is public)

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd bioscout_islamabad
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Add your API keys and database credentials:
     ```env
     OPENAI_API_KEY=your_openai_key_here
     DATABASE_URL=postgresql://user:password@localhost:5432/bioscout_db
     JWT_SECRET_KEY=your_jwt_secret_here
     ```

5. **Initialize database**

   ```bash
   python init_db.py
   ```

6. **Run the Flask server**
   ```bash
   python app.py
   ```
   Server runs on `http://localhost:5001`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd bioscout-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables** (optional)
   - Copy `.env.example` to `.env` if you need custom settings

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3001`

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login (returns JWT)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Chat & Conversations

- `GET /api/chats` - Get all user conversations
- `POST /api/chats` - Create new conversation
- `GET /api/chats/<id>` - Get specific conversation
- `POST /api/chats/<id>/messages` - Add message to conversation
- `DELETE /api/chats/<id>` - Delete conversation

### Species Identification

- `POST /api/identify` - Identify species from uploaded image

### Observations

- `GET /api/observations` - Get all observations
- `POST /api/observations` - Create new observation
- `GET /api/observations/<id>` - Get specific observation
- `PUT /api/observations/<id>` - Update observation
- `DELETE /api/observations/<id>` - Delete observation

### Queries (RAG)

- `POST /api/query` - Submit natural language query to RAG system

---

## 🗄️ Database Schema

### Users Table

```sql
id           UUID PRIMARY KEY
email        VARCHAR(120) UNIQUE
name         VARCHAR(100)
password_hash VARCHAR(255)
created_at   TIMESTAMP
```

### Chat Conversations Table

```sql
id            UUID PRIMARY KEY
user_id       UUID FOREIGN KEY → users.id
title         VARCHAR(200)
message_count INTEGER
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### Chat Messages Table

```sql
id              UUID PRIMARY KEY
conversation_id UUID FOREIGN KEY → chat_conversations.id
role            VARCHAR(20)  -- 'user' or 'assistant'
content         TEXT
created_at      TIMESTAMP
```

### Observations Table

```sql
id                UUID PRIMARY KEY
user_id           UUID FOREIGN KEY → users.id
species_name      VARCHAR(200)
common_name       VARCHAR(200)
category          VARCHAR(50)  -- 'plant', 'animal', 'insect'
location_name     VARCHAR(200)
latitude          DECIMAL
longitude         DECIMAL
observation_date  DATE
image_url         VARCHAR(500)
notes             TEXT
created_at        TIMESTAMP
```

---

## 🛠️ Technology Stack

### Backend

- **Flask** - Web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **Flask-JWT-Extended** - JWT authentication
- **Flask-CORS** - CORS handling
- **LlamaIndex** - RAG framework
- **OpenAI** - Embeddings and LLM
- **Pillow** - Image processing
- **Requests** - HTTP client

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Leaflet** - Interactive maps
- **React-Leaflet** - Leaflet React bindings

---

## 📝 Usage Examples

### 1. Identify a Species (CLI)

```bash
python api.py path/to/image.jpg
```

### 2. Ask a Biodiversity Question (Web)

1. Log in to the platform
2. Navigate to Chat page
3. Type: "What bird species are found in Margalla Hills?"
4. Get AI-powered response with citations

### 3. Add an Observation (Web)

1. Upload an image on the Identify page
2. Get species identification
3. Save as observation with location and notes
4. View on the interactive map

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication with expiry
- ✅ User data isolation (users see only their own data)
- ✅ CORS protection
- ✅ SQL injection prevention via ORM
- ✅ Environment variable protection
- ✅ `.gitignore` configured to prevent API key leakage

---

## 📦 Deployment

### Backend Deployment (e.g., Heroku, Railway)

1. Set environment variables in hosting platform
2. Configure PostgreSQL database
3. Run database migrations
4. Deploy Flask app

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build production bundle: `npm run build`
2. Configure backend API URL
3. Deploy `dist/` folder

---

## 🧪 Testing

### Backend Tests

```bash
cd bioscout_islamabad
python -m pytest tests/
```

### Frontend Tests

```bash
cd bioscout-frontend
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Your Name** - Initial work

---

## 🙏 Acknowledgments

- iNaturalist for providing the Computer Vision API
- OpenAI for GPT and embedding models
- LlamaIndex for the RAG framework
- The open-source community

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for biodiversity conservation in Islamabad**
