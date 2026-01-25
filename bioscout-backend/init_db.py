#!/usr/bin/env python
"""
Database initialization script for BioScout

This script creates the PostgreSQL database and sets up the schema.
Make sure PostgreSQL is installed and running before running this script.

Usage:
    python init_db.py
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def parse_database_url(url):
    """Parse PostgreSQL URL into components"""
    # URL format: postgresql://username:password@host:port/database
    url = url.replace('postgresql://', '')
    
    # Split credentials from host
    if '@' in url:
        credentials, host_db = url.split('@')
        username, password = credentials.split(':')
    else:
        username, password = None, None
        host_db = url
    
    # Split host and database
    if '/' in host_db:
        host_port, database = host_db.rsplit('/', 1)
    else:
        host_port = host_db
        database = 'bioscout_db'
    
    # Split host and port
    if ':' in host_port:
        host, port = host_port.split(':')
    else:
        host = host_port
        port = '5432'
    
    return {
        'user': username or 'postgres',
        'password': password or 'postgres',
        'host': host or 'localhost',
        'port': port,
        'database': database
    }

def create_database():
    """Create the BioScout database"""
    database_url = os.getenv('DATABASE_URL', 'postgresql://bioscout:bioscout@localhost:5432/bioscout_db')
    db_config = parse_database_url(database_url)
    
    print("=" * 60)
    print("BioScout PostgreSQL Database Setup")
    print("=" * 60)
    print(f"Host: {db_config['host']}")
    print(f"Port: {db_config['port']}")
    print(f"Database: {db_config['database']}")
    print(f"User: {db_config['user']}")
    print("=" * 60)
    
    try:
        # Connect to default 'postgres' database
        print("\nConnecting to PostgreSQL server...")
        conn = psycopg2.connect(
            user=db_config['user'],
            password=db_config['password'],
            host=db_config['host'],
            port=db_config['port'],
            database='postgres'
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_config['database']}'")
        db_exists = cursor.fetchone()
        
        if db_exists:
            print(f"Database '{db_config['database']}' already exists.")
            drop = input("Do you want to drop and recreate it? (y/n): ").lower()
            if drop == 'y':
                cursor.execute(sql.SQL("DROP DATABASE {}").format(sql.Identifier(db_config['database'])))
                print(f"Dropped existing database '{db_config['database']}'")
            else:
                print("Using existing database.")
                cursor.close()
                conn.close()
                return True
        
        # Create database
        print(f"\nCreating database '{db_config['database']}'...")
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(db_config['database'])))
        print(f"✓ Database created successfully")
        
        cursor.close()
        conn.close()
        
        # Now create tables using Flask
        print("\nInitializing database schema with Flask ORM...")
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        from app import create_app
        app = create_app()
        
        with app.app_context():
            from models import db
            db.create_all()
            print("✓ Database tables created successfully")
        
        print("\n" + "=" * 60)
        print("Database setup completed successfully!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Update your .env file with the database credentials")
        print("2. Run 'pip install -r requirements.txt' if needed")
        print("3. Run 'python app.py' to start the Flask server")
        print("=" * 60)
        
        return True
        
    except psycopg2.OperationalError as e:
        print(f"\n✗ Failed to connect to PostgreSQL server")
        print(f"  Error: {str(e)}")
        print("\nPlease ensure:")
        print("  - PostgreSQL is installed and running")
        print("  - Database credentials are correct in .env file")
        print("  - Hostname and port are accessible")
        return False
    except psycopg2.Error as e:
        print(f"\n✗ Database error: {str(e)}")
        return False
    except Exception as e:
        print(f"\n✗ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = create_database()
    sys.exit(0 if success else 1)
