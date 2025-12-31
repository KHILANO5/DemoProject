# Database Setup Instructions

## Prerequisites

Make sure you have MySQL installed on your system.

## Setup Steps

### 1. Create the Database

Open MySQL command line:

```bash
mysql -u root -p
```

Enter your MySQL password when prompted, then run:

```sql
CREATE DATABASE IF NOT EXISTS rewear;
USE rewear;
```

### 2. Create Tables

Copy and paste the following SQL commands:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  points_balance INT DEFAULT 100,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('tops', 'bottoms', 'dresses', 'outerwear', 'accessories', 'shoes') NOT NULL,
  size VARCHAR(50) NOT NULL,
  item_condition ENUM('like-new', 'good', 'fair') NOT NULL,
  images JSON,
  points_value INT DEFAULT 50,
  status ENUM('available', 'pending', 'swapped') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Swaps table
CREATE TABLE IF NOT EXISTS swaps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requester_id INT NOT NULL,
  requester_item_id INT,
  owner_id INT NOT NULL,
  owner_item_id INT NOT NULL,
  swap_type ENUM('direct', 'points') NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (requester_item_id) REFERENCES items(id) ON DELETE SET NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_item_id) REFERENCES items(id) ON DELETE CASCADE,
  INDEX idx_requester_id (requester_id),
  INDEX idx_owner_id (owner_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Verify Tables

Check that all tables were created:

```sql
SHOW TABLES;
DESCRIBE users;
DESCRIBE items;
DESCRIBE swaps;
```

### 4. Exit MySQL

```sql
EXIT;
```

## Alternative: Using the Schema File

If you prefer, you can run the schema file directly:

```bash
mysql -u root -p rewear < database/schema.sql
```

## Troubleshooting

- **Access Denied**: Make sure you're using the correct MySQL username and password
- **Database Exists**: If the database already exists, you can drop it first with `DROP DATABASE rewear;`
- **Permission Issues**: Make sure your MySQL user has CREATE and ALTER privileges

## Next Steps

After setting up the database:

1. Update your `.env` file with the correct database credentials
2. Run `npm run dev` to start the development server
3. Visit http://localhost:3000 to see the application
