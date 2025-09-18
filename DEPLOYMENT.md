# 🚀 Deployment Checklist for OlfactiveEcho

## ✅ Files Cleaned Up
- ❌ Removed `test-*.js` files (development test files)
- ❌ Removed `debug-*.js` files (debugging utilities) 
- ❌ Cleaned uploads directory (user uploaded files)
- ❌ Removed sensitive email credentials from .env.example
- ✅ Added comprehensive .gitignore
- ✅ Created detailed README.md
- ✅ Added .gitkeep for uploads directory

## 📋 What Your Friends Need To Do

### 1. Prerequisites Installation
```bash
# Install Node.js (v16+)
# Download from: https://nodejs.org/

# Install MongoDB
# Option A: Local MongoDB - https://www.mongodb.com/try/download/community
# Option B: MongoDB Atlas (Cloud) - https://cloud.mongodb.com/ (Recommended)

# Install Git
# Download from: https://git-scm.com/
```

### 2. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/anish-off/OlfactiveEcho.git
cd OlfactiveEcho

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env file with their database details

# Frontend setup (in new terminal)
cd ../frontend
npm install
```

### 3. Database Setup Options

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
# Use connection string: mongodb://localhost:27017
```

#### Option B: MongoDB Atlas (Recommended)
```bash
# 1. Go to https://cloud.mongodb.com/
# 2. Create free account
# 3. Create new cluster (free tier available)
# 4. Get connection string
# 5. Use in .env: mongodb+srv://username:password@cluster.mongodb.net/olfactiveecho
```

### 4. Environment Configuration
Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017
# OR
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/olfactiveecho

JWT_SECRET=their-unique-secret-key
EMAIL_USER=their-email@gmail.com (optional)
EMAIL_PASS=their-app-password (optional)
```

### 5. Start the Application
```bash
# Terminal 1: Backend
cd backend
npm run dev

# IMPORTANT: Seed the database (one time only)
npm run seed

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### 6. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- **Admin Login**: admin@olfactiveecho.com / AdminPass123!

## 🔧 Common Issues & Solutions

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
# For local: start MongoDB service
# For Atlas: check connection string and whitelist IP
```

### Port Conflicts
```bash
# If ports 5000 or 5173 are busy
# Change PORT in backend/.env
# Change port in frontend by running: npm run dev -- --port 3000
```

### Missing Dependencies
```bash
# If modules missing
cd backend && npm install
cd frontend && npm install
```

## 🎯 Demo Data
The app includes comprehensive sample data via the seed script:
- **20+ Premium Perfumes** across different scent families
- **Sample vials** for each perfume (2ml sizes)
- **Admin account** for management features
- **Realistic pricing** from ₹1,999 to ₹5,500

**CRITICAL**: Run `npm run seed` in the backend directory - without this, the app will be empty!

## 🌟 Features to Test
1. **Registration/Login** - Create new accounts
2. **Product Browsing** - View perfumes by category
3. **Scent Matcher** - AI-powered recommendations
4. **Shopping Cart** - Add products and checkout
5. **Wishlist** - Save favorite items
6. **Collections** - Browse by gender/scent family

---
**Your friends will have a fully functional perfume e-commerce platform!** 🌸✨