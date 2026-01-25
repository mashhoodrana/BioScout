# PostgreSQL Backend Setup Guide

## Step 1: Install PostgreSQL

### Windows

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation, remember the password you set for the 'postgres' user
4. Accept default port 5432

### Verify Installation

```bash
psql --version
```

## Step 2: Install Python Dependencies

```bash
cd bioscout_islamabad
pip install -r requirements.txt
```

The new dependencies added:

- `flask-sqlalchemy==3.0.5` - ORM for database
- `psycopg2-binary==2.9.9` - PostgreSQL adapter
- `flask-jwt-extended==4.5.2` - JWT authentication
- `bcrypt==4.0.1` - Password hashing

## Step 3: Configure Environment Variables

1. Copy the example file:

```bash
copy .env.example .env
```

2. Edit `.env` with your settings:

```
DATABASE_URL=postgresql://bioscout:bioscout@localhost:5432/bioscout_db
JWT_SECRET_KEY=your-super-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key
INATURALIST_API_TOKEN=your-inaturalist-token
FLASK_ENV=development
FLASK_DEBUG=True
```

## Step 4: Create PostgreSQL User and Database

Open PostgreSQL command line:

```bash
psql -U postgres
```

Then run:

```sql
CREATE USER bioscout WITH PASSWORD 'bioscout';
ALTER ROLE bioscout SET client_encoding TO 'utf8';
ALTER ROLE bioscout SET default_transaction_isolation TO 'read committed';
ALTER ROLE bioscout SET default_transaction_deferrable TO on;
ALTER ROLE bioscout SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE bioscout_db TO bioscout;
```

Or use the initialization script:

```bash
python init_db.py
```

## Step 5: Initialize Database Schema

The database tables are created automatically when Flask app starts:

```bash
python app.py
```

Or run the init script:

```bash
python init_db.py
```

## Database Schema

### Users Table

- `id` (UUID) - Primary key
- `email` (String) - Unique, indexed
- `name` (String) - User's full name
- `password_hash` (String) - Bcrypt hashed password
- `created_at` (DateTime) - Account creation time
- `updated_at` (DateTime) - Last update time

### Chat Conversations Table

- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `title` (String) - Conversation title (first message)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Chat Messages Table

- `id` (UUID) - Primary key
- `conversation_id` (UUID) - Foreign key to conversations
- `role` (String) - 'user' or 'assistant'
- `content` (Text) - Message content
- `created_at` (DateTime)

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user

  ```json
  {
    "email": "user@example.com",
    "name": "User Name",
    "password": "password123",
    "confirm_password": "password123"
  }
  ```

- `POST /api/auth/login` - Login user

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/logout` - Logout (requires token)

- `GET /api/auth/me` - Get current user (requires token)

### Chat History

- `GET /api/chats` - Get all conversations (requires token)

- `POST /api/chats` - Create new conversation (requires token)

  ```json
  {
    "first_message": "What plants are near?",
    "response": "Found these plants..."
  }
  ```

- `GET /api/chats/{id}` - Get conversation details (requires token)

- `POST /api/chats/{id}/messages` - Add message to conversation (requires token)

  ```json
  {
    "message": "User question",
    "response": "Assistant answer"
  }
  ```

- `DELETE /api/chats/{id}` - Delete conversation (requires token)

## Testing Database Connection

```python
# test_db.py
import os
from dotenv import load_dotenv
load_dotenv()

from app import create_app, db
from models import User

app = create_app()

with app.app_context():
    # Create a test user
    user = User(
        email='test@example.com',
        name='Test User'
    )
    user.set_password('test123')

    db.session.add(user)
    db.session.commit()

    print("✓ Test user created successfully")

    # Verify user
    found_user = User.query.filter_by(email='test@example.com').first()
    print(f"✓ User found: {found_user.name}")
```

## Troubleshooting

### Connection Refused

- Ensure PostgreSQL service is running
- Check DATABASE_URL in .env file

### Authentication Failed

- Verify postgres password
- Check database user permissions

### Module Not Found

- Install missing dependencies: `pip install -r requirements.txt`
- Check Python version (3.8+)

## Next Steps

1. Update frontend to use API endpoints
2. Replace localStorage with API calls
3. Implement token refresh mechanism
4. Add error handling and logging
5. Test end-to-end flow
