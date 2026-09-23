ALTER TABLE email_tokens DROP CONSTRAINT IF EXISTS email_tokens_token_hash_key;
DROP INDEX IF EXISTS ix_email_tokens_token_hash;
DROP INDEX IF EXISTS email_tokens_token_hash_key;

CREATE INDEX IF NOT EXISTS idx_email_tokens_token_hash ON email_tokens(token_hash);
