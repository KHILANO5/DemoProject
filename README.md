# ReWear - Community Clothing Exchange Platform

A sustainable fashion platform built with Next.js and MySQL that enables users to exchange unused clothing through direct swaps or a points-based redemption system.

## Features

- **User Authentication**: Email/password signup and login with JWT
- **Landing Page**: Platform introduction with featured items carousel
- **User Dashboard**: Profile, points balance, uploaded items, and swap management
- **Item Browsing**: Search and filter items by category
- **Item Detail**: Image gallery, full description, and swap request options
- **Swap System**: Direct item swaps or points-based redemption
- **Points System**: 
  - Start with 100 points
  - Earn 20 points for listing items
  - Earn 30 points for successful swaps
  - Redeem items using points

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MySQL with mysql2
- **Authentication**: JWT with bcrypt
- **Styling**: Vanilla CSS with modern design system

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MySQL Database

Create a MySQL database and run the schema:

```bash
mysql -u root -p < database/schema.sql
```

Or manually create the database:

```sql
CREATE DATABASE rewear;
USE rewear;
-- Then copy and paste the contents of database/schema.sql
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rewear
JWT_SECRET=your-secret-key-change-this-in-production
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── components/          # Reusable React components
│   ├── Navbar.tsx
│   └── ItemCard.tsx
├── pages/
│   ├── api/            # Backend API routes
│   │   ├── auth/       # Authentication endpoints
│   │   ├── items/      # Item management endpoints
│   │   └── swaps/      # Swap management endpoints
│   ├── items/          # Item pages
│   ├── dashboard.tsx   # User dashboard
│   ├── login.tsx       # Login page
│   ├── signup.tsx      # Signup page
│   └── index.tsx       # Landing page
├── styles/             # CSS modules and global styles
├── lib/                # Utility functions
│   ├── db.ts          # Database connection
│   └── authMiddleware.ts
├── types/              # TypeScript type definitions
└── database/           # Database schema
```

## Usage Guide

### For Users

1. **Sign Up**: Create an account to start with 100 points
2. **List Items**: Upload clothing items and earn 20 points each
3. **Browse**: Search and filter items by category
4. **Request Swaps**: Choose direct swap or points redemption
5. **Manage Swaps**: Accept or reject swap requests in your dashboard

### For Development

- All API routes are in `pages/api/`
- Database queries use connection pooling from `lib/db.ts`
- Protected routes use `authMiddleware` for JWT verification
- Styling uses CSS custom properties defined in `styles/globals.css`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (protected)

### Items
- `GET /api/items` - List all items with filters
- `POST /api/items` - Create new item (protected)
- `GET /api/items/featured` - Get featured items
- `GET /api/items/[id]` - Get item details
- `PUT /api/items/[id]` - Update item (protected)
- `DELETE /api/items/[id]` - Delete item (protected)

### Swaps
- `GET /api/swaps` - List user's swaps (protected)
- `POST /api/swaps` - Create swap request (protected)
- `POST /api/swaps/[id]/accept` - Accept swap (protected)
- `POST /api/swaps/[id]/reject` - Reject swap (protected)

## Design Features

- **Dark Theme**: Modern dark mode with vibrant accents
- **Glassmorphism**: Frosted glass effects on cards and modals
- **Responsive**: Mobile-first design with breakpoints
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Semantic HTML and ARIA labels

## Future Enhancements

- Image upload functionality (currently uses URLs)
- User profiles and ratings
- Messaging system between users
- Location-based filtering
- Email notifications
- Admin dashboard

## License

MIT