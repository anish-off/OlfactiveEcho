# OlfactiveEcho - Premium Fragrance Collection Platform

A full-stack e-commerce platform for luxury perfumes and fragrances, built with React.js frontend and Node.js backend.

## ✨ Features

- **Beautiful Product Showcase**: Elegant product displays with image galleries
- **Smart Fragrance Matcher**: AI-powered scent recommendations 
- **User Authentication**: Secure login/registration system
- **Shopping Cart & Wishlist**: Complete e-commerce functionality
- **Order Management**: Track orders and purchase history
- **Responsive Design**: Works perfectly on all devices
- **Admin Dashboard**: Manage products, orders, and users

## 🚀 Quick Setup Guide

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or cloud) - [Get MongoDB Atlas free](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download here](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/anish-off/OlfactiveEcho.git
cd OlfactiveEcho
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
```

**Edit `.env` file with your settings:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/olfactiveecho
# or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/olfactiveecho

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (use a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (optional - for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Start the backend server:**
```bash
npm run dev
```

**Seed the database with sample data (IMPORTANT!):**
```bash
npm run seed
```
*This creates 20+ perfumes, an admin account, and sample products - essential for the app to work properly!*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
OlfactiveEcho/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── context/        # React context providers
│   │   ├── api/            # API integration
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json
│
├── backend/                 # Node.js backend
│   ├── controllers/        # Route handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── data/             # Sample data
│   └── package.json
│
└── README.md
```

## 🔧 Environment Configuration

### Backend Environment Variables (.env)
```env
# Required
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
PORT=5000

# Optional (for email features)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
```

### Frontend Environment Variables (if needed)
Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:5000
```

## 🎯 First Time Setup

1. **Start the backend server** (in `backend/` directory: `npm run dev`)
2. **Seed the database** (in `backend/` directory: `npm run seed`) - **CRITICAL STEP!**
3. **Start the frontend server** (in `frontend/` directory: `npm run dev`)
4. **Explore the features**:
   - Browse 20+ premium perfumes in the shop
   - Try the scent matcher
   - Add items to cart and wishlist
   - Place test orders

## 🛠 Development Commands

### Backend
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run seed       # Populate database with 20+ perfumes (RUN THIS FIRST!)
```

### Frontend  
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 📱 Main Features

### For Users
- **Product Browsing**: View perfumes by category, gender, scent family
- **Smart Recommendations**: AI-powered fragrance matching
- **Shopping Cart**: Add products and manage orders
- **User Profile**: Track orders and manage account
- **Wishlist**: Save favorite products

### For Developers
- **Clean Architecture**: Well-organized, maintainable codebase
- **Modern Stack**: React.js + Node.js + MongoDB
- **Responsive Design**: Mobile-first approach
- **API Documentation**: RESTful API with clear endpoints

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Environment variable protection

## 🎨 Tech Stack

### Frontend
- **React.js 18** - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens

## 🤝 Contributing

This is a personal project, but feel free to:
1. Fork the repository
2. Create feature branches
3. Submit pull requests
4. Report issues or suggestions

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure MongoDB is running
3. Verify environment variables are set correctly
4. Make sure both servers are running on correct ports

## 🌟 Demo Accounts

**Admin Account** (created by seeding):
- **Email**: admin@olfactiveecho.com
- **Password**: AdminPass123!

**Regular Users**: Create your own account through registration

---

**Enjoy exploring the world of premium fragrances with OlfactiveEcho!** 🌸✨
