CREATE TABLE oauth_exchange_codes (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id),
    code_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    new_user BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_oauth_exchange_codes_account_id ON oauth_exchange_codes(account_id);
CREATE INDEX idx_oauth_exchange_codes_expires_at ON oauth_exchange_codes(expires_at);
