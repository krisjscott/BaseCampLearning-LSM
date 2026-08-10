CREATE TABLE otps (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_otps_email ON otps(email);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
