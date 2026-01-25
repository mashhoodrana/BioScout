"""Google OAuth routes for authentication"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import db, User
import logging
from datetime import datetime

bp = Blueprint('google_auth', __name__, url_prefix='/api/auth')
logger = logging.getLogger(__name__)


@bp.route('/google-login', methods=['POST'])
def google_login():
    """Login or register user via Google OAuth
    
    Request body:
        {
            "email": "user@gmail.com",
            "name": "User Name",
            "google_id": "123456789"
        }
    
    Returns:
        JSON with JWT token and user data
    """
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'name' not in data:
            return jsonify({'error': 'Missing email or name'}), 400
        
        email = data['email']
        name = data['name']
        google_id = data.get('google_id', '')
        
        # Find or create user
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Create new user (no password needed for Google auth)
            user = User(
                email=email,
                name=name,
                password_hash='google_oauth'  # Special marker for Google users
            )
            db.session.add(user)
            db.session.commit()
            logger.info(f"New user created via Google: {email}")
        
        # Generate JWT token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'created_at': user.created_at.isoformat(),
            },
            'message': 'Login successful'
        }), 200
        
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        return jsonify({'error': 'Google login failed'}), 500


@bp.route('/google-signup', methods=['POST'])
def google_signup():
    """Register or login user via Google OAuth (signup flow)
    
    Request body:
        {
            "email": "user@gmail.com",
            "name": "User Name",
            "google_id": "123456789"
        }
    
    Returns:
        JSON with JWT token and user data
    """
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'name' not in data:
            return jsonify({'error': 'Missing email or name'}), 400
        
        email = data['email']
        name = data['name']
        google_id = data.get('google_id', '')
        
        # Check if user already exists
        user = User.query.filter_by(email=email).first()
        
        if user:
            # User exists, just login them
            access_token = create_access_token(identity=str(user.id))
            return jsonify({
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'created_at': user.created_at.isoformat(),
                },
                'message': 'Login successful'
            }), 200
        
        # Create new user
        user = User(
            email=email,
            name=name,
            password_hash='google_oauth'  # Special marker for Google users
        )
        db.session.add(user)
        db.session.commit()
        logger.info(f"New user created via Google signup: {email}")
        
        # Generate JWT token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'created_at': user.created_at.isoformat(),
            },
            'message': 'Signup successful'
        }), 201
        
    except Exception as e:
        logger.error(f"Google signup error: {str(e)}")
        return jsonify({'error': 'Google signup failed'}), 500
