# Database Setup Guide

## Prerequisites
- MySQL 8.0 or higher installed on your system

## Setup Steps

### 1. Start MySQL Server
```bash
# On macOS (if using Homebrew)
brew services start mysql

# Or start manually
mysql.server start
```

### 2. Create Database
```bash
# Connect to MySQL
mysql -u root -p

# Run the schema (from MySQL prompt)
source database/schema.sql;

# Or run directly
mysql -u root -p < database/schema.sql
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rewear
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 4. Test Connection
The application will automatically connect to the database when you start the dev server.

```bash
npm run dev
```
