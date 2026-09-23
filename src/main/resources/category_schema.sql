-- =============================================================================
-- AwardHub: Award Category Management Module Database Schema
-- Compatible with MySQL 8.x / MariaDB
-- =============================================================================

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    award_event_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    rules TEXT,
    nominee_eligibility TEXT,
    voter_eligibility TEXT,
    nomination_requirements TEXT,
    nomination_start_date DATETIME NOT NULL,
    nomination_end_date DATETIME NOT NULL,
    voting_start_date DATETIME NOT NULL,
    voting_end_date DATETIME NOT NULL,
    result_publication_date DATETIME NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    archived_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(100) DEFAULT NULL,
    CONSTRAINT uk_award_event_category_name UNIQUE (award_event_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_category_event ON categories (award_event_id);
CREATE INDEX idx_category_status ON categories (status);

CREATE TABLE IF NOT EXISTS category_criteria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    criterion_name VARCHAR(150) NOT NULL,
    description TEXT,
    weight DECIMAL(5, 2) NOT NULL,
    max_score INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_criteria_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_criteria_category ON category_criteria (category_id);
