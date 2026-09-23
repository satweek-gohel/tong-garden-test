ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE email_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    purpose VARCHAR(30) NOT NULL CHECK (purpose IN ('email_verification', 'password_reset')),
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_tokens_user_id ON email_tokens(user_id);
CREATE INDEX idx_email_tokens_token_hash ON email_tokens(token_hash);
CREATE INDEX idx_email_tokens_purpose ON email_tokens(purpose);
