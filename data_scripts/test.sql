-- Table 1: roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Table 2: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(300) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    role_id INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Table 3: verification_tokens
CREATE TABLE verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(20) DEFAULT 'activation' CHECK (type IN ('activation', 'reset')),
    expire_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes utiles
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);

-- Données initiales des rôles
INSERT INTO roles (id, name) VALUES
(1, 'admin'),
(2, 'recruiter'),
(3, 'candidate');