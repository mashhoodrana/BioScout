"""Chat history routes for managing conversations and messages"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, ChatConversation, ChatMessage, User
import logging

bp = Blueprint('chat', __name__, url_prefix='/api/chats')
logger = logging.getLogger(__name__)


@bp.route('', methods=['GET'])
@jwt_required()
def get_conversations():
    """Get all conversations for current user
    
    Returns:
        JSON array of conversations with message counts
    """
    try:
        user_id = get_jwt_identity()
        
        conversations = ChatConversation.query.filter_by(user_id=user_id).order_by(
            ChatConversation.updated_at.desc()
        ).all()
        
        return jsonify({
            'conversations': [c.to_dict() for c in conversations]
        }), 200
        
    except Exception as e:
        logger.error(f"Get conversations error: {str(e)}")
        return jsonify({'error': 'Failed to get conversations'}), 500


@bp.route('', methods=['POST'])
@jwt_required()
def create_conversation():
    """Create a new conversation with initial message
    
    Request body:
        {
            "first_message": "What plants are near Rawal Lake?",
            "response": "Found 5 plants..."
        }
    
    Returns:
        JSON with created conversation
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'first_message' not in data or 'response' not in data:
            return jsonify({'error': 'Missing first_message or response'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Create conversation with title from first message
        title = data['first_message'][:80]  # First 80 chars as title
        
        conversation = ChatConversation(
            user_id=user_id,
            title=title
        )
        
        db.session.add(conversation)
        db.session.flush()  # Get the ID without committing
        
        # Add initial messages
        user_msg = ChatMessage(
            conversation_id=conversation.id,
            role='user',
            content=data['first_message']
        )
        
        assistant_msg = ChatMessage(
            conversation_id=conversation.id,
            role='assistant',
            content=data['response']
        )
        
        db.session.add(user_msg)
        db.session.add(assistant_msg)
        db.session.commit()
        
        logger.info(f"Conversation created for user {user_id}")
        
        return jsonify({
            'message': 'Conversation created',
            'conversation': conversation.to_dict(include_messages=True)
        }), 201
        
    except Exception as e:
        logger.error(f"Create conversation error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create conversation'}), 500


@bp.route('/<conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation(conversation_id):
    """Get specific conversation with all messages
    
    Returns:
        JSON with conversation and messages
    """
    try:
        user_id = get_jwt_identity()
        
        conversation = ChatConversation.query.filter_by(
            id=conversation_id,
            user_id=user_id
        ).first()
        
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        return jsonify({
            'conversation': conversation.to_dict(include_messages=True)
        }), 200
        
    except Exception as e:
        logger.error(f"Get conversation error: {str(e)}")
        return jsonify({'error': 'Failed to get conversation'}), 500


@bp.route('/<conversation_id>/messages', methods=['POST'])
@jwt_required()
def add_message(conversation_id):
    """Add a message to a conversation
    
    Request body:
        {
            "message": "User query text",
            "response": "Assistant response text"
        }
    
    Returns:
        JSON with updated conversation
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'message' not in data or 'response' not in data:
            return jsonify({'error': 'Missing message or response'}), 400
        
        conversation = ChatConversation.query.filter_by(
            id=conversation_id,
            user_id=user_id
        ).first()
        
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Add user message
        user_msg = ChatMessage(
            conversation_id=conversation_id,
            role='user',
            content=data['message']
        )
        
        # Add assistant message
        assistant_msg = ChatMessage(
            conversation_id=conversation_id,
            role='assistant',
            content=data['response']
        )
        
        db.session.add(user_msg)
        db.session.add(assistant_msg)
        
        # Update conversation updated_at
        conversation.updated_at = db.func.now()
        
        db.session.commit()
        
        logger.info(f"Message added to conversation {conversation_id}")
        
        return jsonify({
            'message': 'Message added',
            'conversation': conversation.to_dict(include_messages=True)
        }), 201
        
    except Exception as e:
        logger.error(f"Add message error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to add message'}), 500


@bp.route('/<conversation_id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(conversation_id):
    """Delete a conversation and all its messages
    
    Returns:
        JSON with success message
    """
    try:
        user_id = get_jwt_identity()
        
        conversation = ChatConversation.query.filter_by(
            id=conversation_id,
            user_id=user_id
        ).first()
        
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        db.session.delete(conversation)
        db.session.commit()
        
        logger.info(f"Conversation {conversation_id} deleted")
        
        return jsonify({
            'message': 'Conversation deleted'
        }), 200
        
    except Exception as e:
        logger.error(f"Delete conversation error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete conversation'}), 500
