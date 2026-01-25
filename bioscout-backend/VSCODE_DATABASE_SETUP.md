# PostgreSQL Setup Guide for VS Code (Step-by-Step)

## Overview

This guide walks you through setting up PostgreSQL database for BioScout in VS Code and viewing your data.

---

## **STEP 1: Install PostgreSQL**

### **Windows Installation**

1. **Download PostgreSQL**
   - Go to: https://www.postgresql.org/download/windows/
   - Download version 15 or later

2. **Run Installer**
   - Double-click the downloaded `.exe` file
   - Follow the setup wizard

3. **Important: Set Password**
   - When prompted for password, use: `postgres`
   - Remember this for later!

4. **Port Configuration**
   - Accept default port: **5432**

5. **Finish Installation**
   - Uncheck "Launch Stack Builder" at the end

---

## **STEP 2: Verify PostgreSQL is Running**

### **Method 1: Check Windows Services**

1. Press `Win + R`
2. Type `services.msc`
3. Look for "postgresql" service
4. If status shows "Running" ✓ - You're good!

### **Method 2: Command Line Test**

Open PowerShell and run:

```powershell
psql --version
```

You should see: `psql (PostgreSQL) 15.x`

---

## **STEP 3: Open VS Code Terminal**

1. In VS Code, press `Ctrl + ~` (backtick) to open terminal
2. Make sure you're in the `bioscout_islamabad` folder:
   ```powershell
   cd C:\Users\pc\Downloads\BioScout-main\BioScout-main\bioscout_islamabad
   ```

---

## **STEP 4: Install Python Dependencies**

In the VS Code terminal, run:

```powershell
pip install -r requirements.txt
```

This will install:

- flask-sqlalchemy (database ORM)
- psycopg2-binary (PostgreSQL adapter)
- flask-jwt-extended (authentication)
- bcrypt (password hashing)

Wait for it to complete (1-2 minutes).

---

## **STEP 5: Create .env File**

1. In VS Code, create a new file in `bioscout_islamabad` folder
2. Name it `.env`
3. Copy this content:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bioscout_db
JWT_SECRET_KEY=your-super-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key
INATURALIST_API_TOKEN=your-inaturalist-token
FLASK_ENV=development
FLASK_DEBUG=True
```

Save the file (Ctrl+S).

---

## **STEP 6: Create PostgreSQL User & Database**

### **Using pgAdmin (Easiest)**

1. **Open pgAdmin**
   - PostgreSQL installer created a program called "pgAdmin"
   - Search for "pgAdmin" in Windows
   - Open it (opens in browser at http://localhost:5050)

2. **Login to pgAdmin**
   - Default email: `postgres@pgadmin.org`
   - If first time, create an account

3. **Create Database**
   - Right-click "Databases"
   - Select "Create" → "Database"
   - Name: `bioscout_db`
   - Owner: `postgres`
   - Click "Save"

4. **Verify**
   - You should see `bioscout_db` in the left panel ✓

### **Alternative: Using Command Line**

Open PowerShell:

```powershell
# Connect to PostgreSQL
psql -U postgres

# You'll see: postgres=#
# Type these commands:
CREATE DATABASE bioscout_db;
\l
```

You should see `bioscout_db` in the list. Type `\q` to exit.

---

## **STEP 7: Initialize Database Tables**

In VS Code terminal, run:

```powershell
python init_db.py
```

You should see:

```
============================================================
BioScout PostgreSQL Database Setup
============================================================
Host: localhost
Port: 5432
Database: bioscout_db
User: postgres
============================================================

Connecting to PostgreSQL server...
Creating database 'bioscout_db'...
✓ Database created successfully

Initializing database schema with Flask ORM...
✓ Database tables created successfully

============================================================
Database setup completed successfully!
============================================================
```

**If successful** ✓ - Your database is ready!

---

## **STEP 8: Install VS Code Database Extensions**

This lets you see your data inside VS Code without pgAdmin.

### **Option A: Use PostgreSQL Extension (Recommended)**

1. Open VS Code Extensions (Ctrl+Shift+X)
2. Search for: `PostgreSQL`
3. Install **"PostgreSQL"** by Chris Friedle (blue icon)

4. **Connect in VS Code**
   - Click the PostgreSQL icon in left sidebar
   - Click "Add Connection"
   - Fill in:
     - **Host:** `localhost`
     - **Port:** `5432`
     - **Database:** `bioscout_db`
     - **User:** `postgres`
     - **Password:** `postgres`
   - Click "Connect"

5. **View Database**
   - In the left sidebar, expand `bioscout_db`
   - You'll see: `users`, `chat_conversations`, `chat_messages` tables
   - Right-click any table → "Show in SQL View" to see data

### **Option B: Use Database Client Extension**

1. Search for: `Database Client`
2. Install by "Weijan Chen"
3. Click Database Client icon in left sidebar
4. Click "Create Connection"
5. Choose "PostgreSQL"
6. Fill same details as above

---

## **STEP 9: Start Flask Server**

In VS Code terminal, run:

```powershell
python app.py
```

You should see:

```
==================================================
BioScout Islamabad - Biodiversity Monitoring Platform
==================================================
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5001
```

**Keep this terminal open!** Don't close it while testing.

---

## **STEP 10: Test Database with Sample Data**

Open **another** VS Code terminal (don't close the Flask one).

Create a test script:

```powershell
# Create test file
$content = @"
from app import create_app, db
from models import User, ChatConversation, ChatMessage

app = create_app()

with app.app_context():
    # Create test user
    user = User(
        email='test@bioscout.com',
        name='Test User'
    )
    user.set_password('test123')
    db.session.add(user)
    db.session.commit()

    print('✓ Test user created')
    print(f'  Email: {user.email}')
    print(f'  Name: {user.name}')
    print(f'  ID: {user.id}')

    # Create test conversation
    conv = ChatConversation(
        user_id=user.id,
        title='What plants are near Rawal Lake?'
    )
    db.session.add(conv)
    db.session.commit()

    print('✓ Test conversation created')
    print(f'  Title: {conv.title}')
    print(f'  ID: {conv.id}')

    # Add test messages
    msg1 = ChatMessage(
        conversation_id=conv.id,
        role='user',
        content='What plants are near Rawal Lake?'
    )
    msg2 = ChatMessage(
        conversation_id=conv.id,
        role='assistant',
        content='Found 5 plants: Oak, Pine, Cedar, Juniper, Deodar'
    )
    db.session.add(msg1)
    db.session.add(msg2)
    db.session.commit()

    print('✓ Test messages created')
    print(f'  User message: {msg1.content}')
    print(f'  Assistant message: {msg2.content}')
"@

$content | Out-File -Encoding UTF8 "test_db.py"
```

Then run it:

```powershell
python test_db.py
```

You should see:

```
✓ Test user created
  Email: test@bioscout.com
  Name: Test User
  ID: 550e8400-e29b-41d4-a716-446655440000

✓ Test conversation created
  Title: What plants are near Rawal Lake?
  ID: 550e8400-e29b-41d4-a716-446655440001

✓ Test messages created
  User message: What plants are near Rawal Lake?
  Assistant message: Found 5 plants: Oak, Pine, Cedar, Juniper, Deodar
```

---

## **STEP 11: View Data in VS Code**

### **Using PostgreSQL Extension**

1. In VS Code left sidebar, click **PostgreSQL** icon
2. Expand the connection you created
3. Expand **bioscout_db** → **Tables**
4. Click on **"users"** table
5. You'll see your test user with encrypted password ✓

### **View Chat Data**

1. Click on **"chat_conversations"** table
2. You'll see the test conversation with title and timestamps
3. Click on **"chat_messages"** table
4. You'll see both user and assistant messages

---

## **STEP 12: Query Data Directly**

### **In VS Code PostgreSQL Extension**

1. Right-click on your connection
2. Select "New Query"
3. Enter:
   ```sql
   SELECT id, email, name, created_at FROM users;
   ```
4. Press **Ctrl+Alt+E** to execute
5. See all users in the results panel

### **Other Useful Queries**

Get all conversations:

```sql
SELECT id, user_id, title, created_at FROM chat_conversations;
```

Get all messages:

```sql
SELECT id, conversation_id, role, content, created_at FROM chat_messages;
```

Get messages for a specific conversation:

```sql
SELECT role, content, created_at FROM chat_messages
WHERE conversation_id = 'YOUR_CONVERSATION_ID'
ORDER BY created_at ASC;
```

---

## **STEP 13: Test API Endpoints**

While Flask is running, open another terminal:

### **Test Register**

```powershell
$body = @{
    email = "newuser@example.com"
    name = "New User"
    password = "password123"
    confirm_password = "password123"
} | ConvertTo-Json

curl -X POST http://localhost:5001/api/auth/register `
  -H "Content-Type: application/json" `
  -d $body
```

You should get:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "newuser@example.com",
    "name": "New User",
    "created_at": "2024-01-22T..."
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### **Test Login**

```powershell
$body = @{
    email = "newuser@example.com"
    password = "password123"
} | ConvertTo-Json

curl -X POST http://localhost:5001/api/auth/login `
  -H "Content-Type: application/json" `
  -d $body
```

Copy the `access_token` from the response.

### **View Data in Database**

Go back to PostgreSQL extension, refresh the **users** table:

- You'll see your new user ✓

---

## **STEP 14: Troubleshooting**

### **"Connection Refused"**

- PostgreSQL service not running
- Go to Services (services.msc) and start "postgresql"

### **"Password Authentication Failed"**

- Wrong password in .env
- Check DATABASE_URL uses correct credentials

### **"Database Does Not Exist"**

- Run: `python init_db.py` again
- Or create database in pgAdmin

### **"Module Not Found"**

- Run: `pip install -r requirements.txt`

---

## **Next Steps**

After verifying database works:

1. ✓ Database is set up
2. ✓ Tables are created
3. ✓ Sample data is working
4. ✓ API endpoints are responding

**Now we connect the frontend to these API endpoints!**

See: [Frontend API Integration Guide](../bioscout-frontend/FRONTEND_API_GUIDE.md)
