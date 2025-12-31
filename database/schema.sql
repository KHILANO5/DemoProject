-- ReWear Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS rewear;
USE rewear;

-- ReWear Database Schema (MySQL)

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    points_balance INT DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    `condition` VARCHAR(50) NOT NULL,
    points_value INT NOT NULL,
    image_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS swaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    requester_item_id INT,
    owner_id INT NOT NULL,
    owner_item_id INT NOT NULL,
    swap_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_item_id) REFERENCES items(id) ON DELETE SET NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_swaps_requester ON swaps(requester_id);
CREATE INDEX idx_swaps_owner ON swaps(owner_id);
CREATE INDEX idx_swaps_status ON swaps(status);
