-- CineMetrics Database Initialization
-- Step 1: Create the Database
CREATE DATABASE IF NOT EXISTS cinemetrics;
USE cinemetrics;

-- Step 2: Users Table (Relational Parent)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Step 3: Watchlist Table (Relational Child)
CREATE TABLE IF NOT EXISTS watchlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    rating DECIMAL(3, 1) DEFAULT 0.0,
    watch_date DATE NOT NULL,
    runtime INT NOT NULL COMMENT 'Runtime in minutes',
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Linking to the users table
    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Step 4: Seed Data (Required for the App to connect)
-- Note: Replace 'AdminUser' with your name if you wish!
INSERT INTO users (id, username, email) 
VALUES (1, 'HansJo', 'hansjothomas17@gmail.com')
ON DUPLICATE KEY UPDATE id=id;