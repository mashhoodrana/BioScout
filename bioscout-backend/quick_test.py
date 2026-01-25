#!/usr/bin/env python
"""
Quick database test script for BioScout
Verifies database connection and creates sample data

Usage:
    python quick_test.py
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    print("=" * 70)
    print("BioScout Database Quick Test")
    print("=" * 70)
    
    try:
        print("\n[1/5] Importing Flask and models...")
        from app import create_app, db
        from models import User, ChatConversation, ChatMessage
        print("      ✓ Imports successful")
        
        print("\n[2/5] Creating Flask app and connecting to database...")
        app = create_app()
        with app.app_context():
            print("      ✓ Connected to database")
            
            print("\n[3/5] Checking existing data...")
            user_count = User.query.count()
            conv_count = ChatConversation.query.count()
            msg_count = ChatMessage.query.count()
            print(f"      ✓ Users: {user_count}")
            print(f"      ✓ Conversations: {conv_count}")
            print(f"      ✓ Messages: {msg_count}")
            
            print("\n[4/5] Creating test user...")
            # Check if test user already exists
            test_user = User.query.filter_by(email='test@bioscout.com').first()
            if test_user:
                print("      ⚠ Test user already exists, skipping creation")
                user_id = test_user.id
            else:
                test_user = User(
                    email='test@bioscout.com',
                    name='Test User'
                )
                test_user.set_password('test123')
                db.session.add(test_user)
                db.session.commit()
                user_id = test_user.id
                print(f"      ✓ Test user created")
            
            print(f"      Email: test@bioscout.com")
            print(f"      Password: test123")
            print(f"      ID: {user_id}")
            
            print("\n[5/5] Creating test conversation...")
            test_conv = ChatConversation.query.filter_by(
                user_id=user_id,
                title='What plants are near Rawal Lake?'
            ).first()
            
            if test_conv:
                print("      ⚠ Test conversation already exists, skipping creation")
                conv_id = test_conv.id
            else:
                test_conv = ChatConversation(
                    user_id=user_id,
                    title='What plants are near Rawal Lake?'
                )
                db.session.add(test_conv)
                db.session.commit()
                conv_id = test_conv.id
                
                # Add messages
                msg1 = ChatMessage(
                    conversation_id=conv_id,
                    role='user',
                    content='What plants are near Rawal Lake?'
                )
                msg2 = ChatMessage(
                    conversation_id=conv_id,
                    role='assistant',
                    content='Found 5 plants near Rawal Lake: Oak, Pine, Cedar, Juniper, Deodar'
                )
                db.session.add(msg1)
                db.session.add(msg2)
                db.session.commit()
                print(f"      ✓ Test conversation created with 2 messages")
            
            print(f"      Title: What plants are near Rawal Lake?")
            print(f"      ID: {conv_id}")
        
        print("\n" + "=" * 70)
        print("✓ All tests passed! Database is ready.")
        print("=" * 70)
        print("\nNext steps:")
        print("1. View data in VS Code:")
        print("   - Install 'PostgreSQL' extension (by Chris Friedle)")
        print("   - Connect to localhost:5432/bioscout_db")
        print("   - Expand tables to see your data")
        print("\n2. Start Flask server:")
        print("   - Run: python app.py")
        print("   - API will be available at http://localhost:5001")
        print("\n3. Test API endpoints:")
        print("   - POST /api/auth/register - Register new user")
        print("   - POST /api/auth/login - Login and get token")
        print("   - GET /api/chats - Get all conversations")
        print("=" * 70)
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
