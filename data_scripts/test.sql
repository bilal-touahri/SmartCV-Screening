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

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE SET NULL
);

-- Table 3: verification_tokens
CREATE TABLE verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(20) DEFAULT 'activation'
        CHECK (type IN ('activation', 'reset')),
    expire_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Table 4: offres
CREATE TABLE offres (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    competences TEXT,
    experience VARCHAR(100),
    niveau_etudes VARCHAR(100),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_limite DATE,
    statut VARCHAR(30) DEFAULT 'active'
        CHECK (statut IN ('active', 'inactive', 'expired', 'closed')),
    recruteur_id INT NOT NULL,

    FOREIGN KEY (recruteur_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Table 5: cv
CREATE TABLE cv (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    chemin_fichier VARCHAR(255) NOT NULL,
    texte_extrait TEXT,
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valide BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Table 6: candidatures
CREATE TABLE candidatures (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    offre_id INT NOT NULL,
    cv_id INT NOT NULL,
    date_depot TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(30) DEFAULT 'en_attente'
        CHECK (statut IN ('en_attente', 'acceptee', 'rejetee', 'analysee')),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (offre_id)
        REFERENCES offres(id)
        ON DELETE CASCADE,

    FOREIGN KEY (cv_id)
        REFERENCES cv(id)
        ON DELETE CASCADE,

    UNIQUE (user_id, offre_id)
);

-- Table 7: analyse_cv
CREATE TABLE analyse_cv (
    id SERIAL PRIMARY KEY,
    cv_id INT NOT NULL UNIQUE,
    competences_extraites TEXT,
    annees_experience INT DEFAULT 0,
    soft_skills TEXT,
    langues TEXT,
    niveau_formation VARCHAR(100),
    date_analyse TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cv_id)
        REFERENCES cv(id)
        ON DELETE CASCADE
);

-- Table 8: score_matching
CREATE TABLE score_matching (
    id SERIAL PRIMARY KEY,
    candidature_id INT NOT NULL UNIQUE,
    score_globale NUMERIC(5,2) DEFAULT 0,
    score_competences NUMERIC(5,2) DEFAULT 0,
    score_experiences NUMERIC(5,2) DEFAULT 0,
    score_formation NUMERIC(5,2) DEFAULT 0,
    rang INT,
    date_calcul TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (candidature_id)
        REFERENCES candidatures(id)
        ON DELETE CASCADE
);

-- Table 9: bias_analyse
CREATE TABLE bias_analyse (
    id SERIAL PRIMARY KEY,
    score_id INT NOT NULL,
    type_biais VARCHAR(100),
    groupe_reference VARCHAR(100),
    taux_selection NUMERIC(5,2),
    ecart_mesure NUMERIC(5,2),
    date_analyse TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (score_id)
        REFERENCES score_matching(id)
        ON DELETE CASCADE
);

-- Table 10: test_contrefactual
CREATE TABLE test_contrefactual (
    id SERIAL PRIMARY KEY,
    bias_id INT NOT NULL,
    valeur_original TEXT,
    valeur_modifiee TEXT,
    variable_modifiee VARCHAR(100),
    score_original NUMERIC(5,2),
    score_modifie NUMERIC(5,2),
    ecart NUMERIC(5,2),
    biais_detecte BOOLEAN DEFAULT FALSE,
    date_test TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (bias_id)
        REFERENCES bias_analyse(id)
        ON DELETE CASCADE
);



-- Indexes utiles
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_code ON verification_tokens(code);

CREATE INDEX idx_offres_recruteur_id ON offres(recruteur_id);
CREATE INDEX idx_offres_statut ON offres(statut);

CREATE INDEX idx_cv_user_id ON cv(user_id);

CREATE INDEX idx_candidatures_user_id ON candidatures(user_id);
CREATE INDEX idx_candidatures_offre_id ON candidatures(offre_id);
CREATE INDEX idx_candidatures_cv_id ON candidatures(cv_id);

CREATE INDEX idx_score_matching_candidature_id ON score_matching(candidature_id);
CREATE INDEX idx_score_matching_score_globale ON score_matching(score_globale);

CREATE INDEX idx_bias_analyse_score_id ON bias_analyse(score_id);
CREATE INDEX idx_test_contrefactual_bias_id ON test_contrefactual(bias_id);



-- Données initiales des rôles
INSERT INTO roles (id, name) VALUES
(1, 'admin'),
(2, 'recruiter'),
(3, 'candidate');

-- Reset sequence roles
SELECT setval('roles_id_seq', 3, true);