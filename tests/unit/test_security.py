"""
Unit tests for security utilities.
"""
import pytest
from datetime import datetime, timedelta
from jose import jwt

from app.core.config import settings
from app.core.security import (
    create_access_token,
    verify_password,
    get_password_hash,
    verify_token,
)


class TestPasswordHashing:
    """Test password hashing utilities."""
    
    def test_get_password_hash(self):
        """Test password hashing."""
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        # Hash should be different from original password
        assert hashed != password
        # Hash should be a string
        assert isinstance(hashed, str)
        # Hash should not be empty
        assert len(hashed) > 0
        # Hash should start with bcrypt identifier
        assert hashed.startswith("$2b$")
    
    def test_verify_password_correct(self):
        """Test password verification with correct password."""
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        # Correct password should verify
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password."""
        password = "test_password_123"
        wrong_password = "wrong_password_456"
        hashed = get_password_hash(password)
        
        # Wrong password should not verify
        assert verify_password(wrong_password, hashed) is False
    
    def test_verify_password_empty(self):
        """Test password verification with empty password."""
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        # Empty password should not verify
        assert verify_password("", hashed) is False
    
    def test_hash_different_passwords_produce_different_hashes(self):
        """Test that different passwords produce different hashes."""
        password1 = "password1"
        password2 = "password2"
        
        hash1 = get_password_hash(password1)
        hash2 = get_password_hash(password2)
        
        assert hash1 != hash2
    
    def test_same_password_produces_different_hashes(self):
        """Test that the same password produces different hashes (due to salt)."""
        password = "test_password_123"
        
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Hashes should be different due to salt
        assert hash1 != hash2
        # But both should verify the same password
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestJWTTokens:
    """Test JWT token utilities."""
    
    def test_create_access_token_default_expiry(self):
        """Test creating access token with default expiry."""
        subject = "test_user_123"
        token = create_access_token(subject)
        
        # Token should be a string
        assert isinstance(token, str)
        # Token should not be empty
        assert len(token) > 0
        
        # Decode token to verify contents
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == subject
        
        # Check that expiry exists and is in the future
        exp_timestamp = payload["exp"]
        current_timestamp = datetime.utcnow().timestamp()
        assert exp_timestamp > current_timestamp
        
        # Check that expiry is reasonable (between 1 minute and 2 hours from now)
        min_exp = current_timestamp + 60  # 1 minute
        max_exp = current_timestamp + 7200  # 2 hours
        assert min_exp <= exp_timestamp <= max_exp
    
    def test_create_access_token_custom_expiry(self):
        """Test creating access token with custom expiry."""
        subject = "test_user_123"
        custom_expiry = timedelta(hours=2)
        token = create_access_token(subject, expires_delta=custom_expiry)
        
        # Decode token to verify expiry
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        exp_timestamp = payload["exp"]
        
        # Check that expiry is in the future
        current_timestamp = datetime.utcnow().timestamp()
        assert exp_timestamp > current_timestamp
        
        # Check that expiry is reasonable (between 1.5 and 2.5 hours from now)
        min_exp = current_timestamp + 5400  # 1.5 hours
        max_exp = current_timestamp + 9000  # 2.5 hours
        assert min_exp <= exp_timestamp <= max_exp
    
    def test_create_access_token_integer_subject(self):
        """Test creating access token with integer subject."""
        subject = 12345
        token = create_access_token(subject)
        
        # Decode token to verify subject is converted to string
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == str(subject)
    
    def test_verify_token_valid(self):
        """Test verifying a valid token."""
        subject = "test_user_123"
        token = create_access_token(subject)
        
        verified_subject = verify_token(token)
        assert verified_subject == subject
    
    def test_verify_token_invalid_signature(self):
        """Test verifying token with invalid signature."""
        subject = "test_user_123"
        token = create_access_token(subject)
        
        # Tamper with the token
        tampered_token = token[:-5] + "XXXXX"
        
        verified_subject = verify_token(tampered_token)
        assert verified_subject is None
    
    def test_verify_token_expired(self):
        """Test verifying an expired token."""
        subject = "test_user_123"
        # Create token that expires immediately
        expired_token = create_access_token(subject, expires_delta=timedelta(seconds=-1))
        
        verified_subject = verify_token(expired_token)
        assert verified_subject is None
    
    def test_verify_token_malformed(self):
        """Test verifying a malformed token."""
        malformed_token = "not.a.valid.jwt.token"
        
        verified_subject = verify_token(malformed_token)
        assert verified_subject is None
    
    def test_verify_token_empty(self):
        """Test verifying an empty token."""
        verified_subject = verify_token("")
        assert verified_subject is None
    
    def test_verify_token_no_subject(self):
        """Test verifying token without subject."""
        # Create token manually without subject
        payload = {"exp": datetime.utcnow() + timedelta(minutes=30)}
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        
        verified_subject = verify_token(token)
        assert verified_subject is None


class TestTokenIntegration:
    """Test integration between token creation and verification."""
    
    def test_create_and_verify_token_roundtrip(self):
        """Test creating and verifying token roundtrip."""
        subjects = ["user123", "admin", "test@example.com", "12345"]
        
        for subject in subjects:
            token = create_access_token(subject)
            verified_subject = verify_token(token)
            assert verified_subject == str(subject)
    
    def test_multiple_tokens_different_subjects(self):
        """Test creating multiple tokens with different subjects."""
        subjects = ["user1", "user2", "user3"]
        tokens = []
        
        for subject in subjects:
            token = create_access_token(subject)
            tokens.append(token)
        
        # All tokens should be different
        assert len(set(tokens)) == len(tokens)
        
        # Each token should verify to its original subject
        for i, token in enumerate(tokens):
            verified_subject = verify_token(token)
            assert verified_subject == subjects[i]