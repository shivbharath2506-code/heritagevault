-- HERITAGEVAULT: PostgreSQL Database Schema
-- Digital Museum Management System for Government Museum Chennai

CREATE TABLE IF NOT EXISTS museums (
    id SERIAL PRIMARY KEY,
    museum_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'curator', 'conservator', 'staff')),
    museum_id INTEGER NOT NULL REFERENCES museums(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artifacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    period VARCHAR(100),
    origin VARCHAR(255),
    material VARCHAR(150),
    description TEXT,
    condition VARCHAR(50) NOT NULL DEFAULT 'Good' CHECK (condition IN ('Pristine', 'Good', 'Fair', 'Fragile', 'Critical', 'Under Restoration')),
    location VARCHAR(255) NOT NULL,
    acquisition_date DATE,
    image_url TEXT,
    museum_id INTEGER NOT NULL REFERENCES museums(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exhibitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'Active', 'Completed', 'Cancelled')),
    museum_id INTEGER NOT NULL REFERENCES museums(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exhibition_artifacts (
    id SERIAL PRIMARY KEY,
    exhibition_id INTEGER NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
    artifact_id INTEGER NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
    display_position VARCHAR(100),
    UNIQUE(exhibition_id, artifact_id)
);

CREATE TABLE IF NOT EXISTS conservation_records (
    id SERIAL PRIMARY KEY,
    artifact_id INTEGER NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
    conservation_date DATE NOT NULL,
    conservator VARCHAR(255) NOT NULL,
    condition_before VARCHAR(50) NOT NULL,
    condition_after VARCHAR(50) NOT NULL,
    treatment TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restoration_records (
    id SERIAL PRIMARY KEY,
    artifact_id INTEGER NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
    restoration_date DATE NOT NULL,
    restored_by VARCHAR(255) NOT NULL,
    restoration_type VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cost >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visitor_records (
    id SERIAL PRIMARY KEY,
    visit_date DATE NOT NULL,
    visitor_count INTEGER NOT NULL CHECK (visitor_count >= 0),
    exhibition_id INTEGER REFERENCES exhibitions(id) ON DELETE SET NULL,
    museum_id INTEGER NOT NULL REFERENCES museums(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_museum ON users(museum_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_museum ON artifacts(museum_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_category ON artifacts(category);
CREATE INDEX IF NOT EXISTS idx_artifacts_condition ON artifacts(condition);
CREATE INDEX IF NOT EXISTS idx_exhibitions_museum ON exhibitions(museum_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status);
CREATE INDEX IF NOT EXISTS idx_conservation_artifact ON conservation_records(artifact_id);
CREATE INDEX IF NOT EXISTS idx_restoration_artifact ON restoration_records(artifact_id);
CREATE INDEX IF NOT EXISTS idx_visitors_museum_date ON visitor_records(museum_id, visit_date);
