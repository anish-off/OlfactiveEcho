# OlfactiveEcho - Premium Fragrance E-Commerce Platform# OlfactiveEcho - Premium Fragrance Collection Platform



A full-stack luxury perfume e-commerce platform featuring AI-powered recommendations, multi-channel notifications, and comprehensive admin management. Built with modern web technologies for a seamless shopping experience.A full-stack e-commerce platform for luxury perfumes and fragrances, built with React.js frontend and Node.js backend.



## ✨ Key Features## ✨ Features



### Customer Features- **Beautiful Product Showcase**: Elegant product displays with image galleries

- **Elegant Product Catalog** - Browse premium perfumes with rich details and high-quality images- **Smart Fragrance Matcher**: AI-powered scent recommendations 

- **AI-Powered Recommendations** - Smart fragrance matcher using Google's Gemini AI- **User Authentication**: Secure login/registration system

- **Smart Shopping Cart** - Real-time cart management with quantity adjustments- **Shopping Cart & Wishlist**: Complete e-commerce functionality

- **Wishlist** - Save favorite fragrances for later- **Order Management**: Track orders and purchase history

- **Order Tracking** - Complete order history and status updates- **Responsive Design**: Works perfectly on all devices

- **Multi-Channel Notifications** - Receive updates via Email, SMS, and WhatsApp- **Admin Dashboard**: Manage products, orders, and users

- **Responsive Design** - Seamless experience across all devices

## 🚀 Quick Setup Guide

### Admin Features

- **Product Management** - Full CRUD operations for perfumes, categories, and brands### Prerequisites

- **Order Management** - Process and track customer orders- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)

- **User Management** - View and manage customer accounts- **MongoDB** (local or cloud) - [Get MongoDB Atlas free](https://www.mongodb.com/cloud/atlas)

- **Analytics Dashboard** - Revenue insights and performance metrics- **Git** - [Download here](https://git-scm.com/)

- **Coupon System** - Create and manage promotional codes

- **Activity Logs** - Track all admin actions### 1. Clone the Repository

```bash

### Developer Featuresgit clone https://github.com/anish-off/OlfactiveEcho.git

- **RESTful API** - Well-documented API endpointscd OlfactiveEcho

- **JWT Authentication** - Secure token-based auth system```

- **Cloudinary Integration** - Cloud-based image management

- **Rate Limiting** - Protection against API abuse### 2. Backend Setup

- **Error Handling** - Comprehensive error management```bash

cd backend

## 🚀 Quick Startnpm install



### Prerequisites# Create environment file

- **Node.js** v16+ ([Download](https://nodejs.org/))cp .env.example .env

- **MongoDB** ([Local installation](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)```

- **Git** ([Download](https://git-scm.com/))

**Edit `.env` file with your settings:**

### Installation```env

# Database

1. **Clone the repository**MONGODB_URI=mongodb://localhost:27017/olfactiveecho

```bash# or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/olfactiveecho

git clone https://github.com/anish-off/OlfactiveEcho.git

cd OlfactiveEcho# Server

```PORT=5000

NODE_ENV=development

2. **Backend Setup**

```bash# JWT Secret (use a random string)

cd backendJWT_SECRET=your-super-secret-jwt-key-here

npm install

```# Email Configuration (optional - for password reset)

EMAIL_USER=your-email@gmail.com

Create `.env` file in `backend/` directory:EMAIL_PASS=your-app-password

```env```

# Database

MONGODB_URI=mongodb://localhost:27017/olfactiveecho**Start the backend server:**

# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/olfactiveecho```bash

npm run dev

# Server```

PORT=5000

NODE_ENV=development**Seed the database with sample data (IMPORTANT!):**

```bash

# Authenticationnpm run seed

JWT_SECRET=your-super-secret-jwt-key-change-this```

*This creates 20+ perfumes, an admin account, and sample products - essential for the app to work properly!*

# CORS

CORS_ORIGIN=http://localhost:5173### 3. Frontend Setup

Open a new terminal window:

# Email Notifications (Gmail recommended)```bash

EMAIL_USER=your-email@gmail.comcd frontend

EMAIL_PASS=your-gmail-app-passwordnpm install

npm run dev

# Twilio (Optional - for SMS/WhatsApp)```

TWILIO_ACCOUNT_SID=your-twilio-sid

TWILIO_AUTH_TOKEN=your-twilio-token### 4. Access the Application

TWILIO_PHONE_NUMBER=+1234567890- **Frontend**: http://localhost:5173

TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886- **Backend API**: http://localhost:5000



# Cloudinary (Optional - for image uploads)## 📁 Project Structure

CLOUDINARY_CLOUD_NAME=your-cloud-name

CLOUDINARY_API_KEY=your-api-key```

CLOUDINARY_API_SECRET=your-api-secretOlfactiveEcho/

├── frontend/                 # React.js frontend

# Google Gemini AI (Optional - for recommendations)│   ├── src/

GEMINI_API_KEY=your-gemini-api-key│   │   ├── components/      # Reusable UI components

```│   │   ├── pages/          # Main application pages

│   │   ├── context/        # React context providers

**Seed the database** (Creates sample products and admin account):│   │   ├── api/            # API integration

```bash│   │   └── lib/            # Utility functions

npm run seed│   ├── public/             # Static assets

```│   └── package.json

│

**Start backend server**:├── backend/                 # Node.js backend

```bash│   ├── controllers/        # Route handlers

npm run dev│   ├── models/            # MongoDB schemas

```│   ├── routes/            # API routes

│   ├── middleware/        # Custom middleware

3. **Frontend Setup** (New terminal window)│   ├── data/             # Sample data

```bash│   └── package.json

cd frontend│

npm install└── README.md

npm run dev```

```

## 🔧 Environment Configuration

4. **Access the Application**

- **Frontend**: http://localhost:5173### Backend Environment Variables (.env)

- **Backend API**: http://localhost:5000```env

- **API Health Check**: http://localhost:5000/api/health# Required

MONGODB_URI=your-mongodb-connection-string

## 📁 Project StructureJWT_SECRET=your-jwt-secret-key

PORT=5000

```

OlfactiveEcho/# Optional (for email features)

├── backend/EMAIL_USER=your-email@gmail.com

│   ├── config/              # Database configurationEMAIL_PASS=your-email-app-password

│   ├── controllers/         # Request handlers```

│   ├── models/             # MongoDB schemas

│   ├── routes/             # API route definitions### Frontend Environment Variables (if needed)

│   ├── middleware/         # Auth & validation middlewareCreate `frontend/.env.local`:

│   ├── services/           # Email, SMS, WhatsApp services```env

│   ├── scripts/            # Database seeding scriptsVITE_API_URL=http://localhost:5000

│   ├── data/              # Sample perfume data```

│   └── server.js          # Express app entry point

│## 🎯 First Time Setup

├── frontend/

│   ├── src/1. **Start the backend server** (in `backend/` directory: `npm run dev`)

│   │   ├── components/    # Reusable UI components2. **Seed the database** (in `backend/` directory: `npm run seed`) - **CRITICAL STEP!**

│   │   ├── pages/        # Application pages3. **Start the frontend server** (in `frontend/` directory: `npm run dev`)

│   │   ├── context/      # React Context (Auth, Cart)4. **Explore the features**:

│   │   ├── api/          # API service layer   - Browse 20+ premium perfumes in the shop

│   │   └── lib/          # Utility functions   - Try the scent matcher

│   ├── public/           # Static assets   - Add items to cart and wishlist

│   └── vite.config.js    # Vite configuration   - Place test orders

│

└── README.md## 🛠 Development Commands

```

### Backend

## 🎯 API Overview```bash

npm run dev        # Start development server with nodemon

### Authenticationnpm start          # Start production server

- `POST /api/auth/register` - Create new user accountnpm run seed       # Populate database with 20+ perfumes (RUN THIS FIRST!)

- `POST /api/auth/login` - User login```

- `GET /api/auth/me` - Get current user (requires auth)

### Frontend  

### Products```bash

- `GET /api/perfumes` - List all perfumes (with filters)npm run dev        # Start development server

- `GET /api/perfumes/:id` - Get single perfumenpm run build      # Build for production

- `POST /api/perfumes` - Create perfume (admin only)npm run preview    # Preview production build

- `PUT /api/perfumes/:id` - Update perfume (admin only)```

- `DELETE /api/perfumes/:id` - Delete perfume (admin only)

## 📱 Main Features

### Orders

- `POST /api/orders` - Create new order### For Users

- `GET /api/orders` - Get user's orders- **Product Browsing**: View perfumes by category, gender, scent family

- `GET /api/orders/all` - Get all orders (admin only)- **Smart Recommendations**: AI-powered fragrance matching

- `PUT /api/orders/:id/status` - Update order status (admin only)- **Shopping Cart**: Add products and manage orders

- **User Profile**: Track orders and manage account

### Admin- **Wishlist**: Save favorite products

- `GET /api/admin/users` - List all users

- `GET /api/admin/analytics` - Revenue analytics### For Developers

- `GET /api/admin/logs` - Activity logs- **Clean Architecture**: Well-organized, maintainable codebase

- **Modern Stack**: React.js + Node.js + MongoDB

### Cart & Reviews- **Responsive Design**: Mobile-first approach

- `POST /api/cart` - Add to cart- **API Documentation**: RESTful API with clear endpoints

- `GET /api/cart` - Get cart items

- `POST /api/reviews` - Create review## 🔐 Security Features

- `GET /api/reviews/:perfumeId` - Get perfume reviews

- JWT-based authentication

## 🛠 Development Commands- Password hashing with bcrypt

- Input validation and sanitization

### Backend- CORS protection

```bash- Environment variable protection

npm run dev          # Development server with auto-restart

npm start           # Production server## 🎨 Tech Stack

npm run seed        # Seed database with sample data

```### Frontend

- **React.js 18** - Modern UI framework

### Frontend- **Vite** - Fast build tool

```bash- **Tailwind CSS** - Utility-first styling

npm run dev         # Development server (Vite)- **Framer Motion** - Smooth animations

npm run build       # Production build- **React Router** - Client-side routing

npm run preview     # Preview production build

npm run lint        # Run ESLint### Backend

```- **Node.js** - Server runtime

- **Express.js** - Web framework

## 🎨 Tech Stack- **MongoDB** - NoSQL database

- **Mongoose** - ODM for MongoDB

### Frontend- **JWT** - Authentication tokens

- **React 19** - UI library

- **Vite** - Build tool and dev server## 🤝 Contributing

- **Tailwind CSS** - Utility-first CSS framework

- **Framer Motion** - Animation libraryThis is a personal project, but feel free to:

- **React Router** - Client-side routing1. Fork the repository

- **Axios** - HTTP client2. Create feature branches

- **Lucide React** - Icon library3. Submit pull requests

4. Report issues or suggestions

### Backend

- **Node.js** - JavaScript runtime## 📞 Support

- **Express 5** - Web framework

- **MongoDB** - NoSQL databaseIf you encounter any issues:

- **Mongoose** - ODM for MongoDB1. Check the console for error messages

- **JWT** - Authentication2. Ensure MongoDB is running

- **Bcrypt** - Password hashing3. Verify environment variables are set correctly

- **Nodemailer** - Email service4. Make sure both servers are running on correct ports

- **Twilio** - SMS/WhatsApp service

- **Cloudinary** - Image hosting## 🌟 Demo Accounts

- **Google Gemini AI** - Recommendations

**Admin Account** (created by seeding):

## 🔐 Security Features- **Email**: admin@olfactiveecho.com

- **Password**: AdminPass123!

- JWT-based authentication with HTTP-only cookies

- Password hashing using bcrypt**Regular Users**: Create your own account through registration

- Input validation and sanitization

- CORS protection---

- Helmet.js security headers

- Rate limiting on API endpoints**Enjoy exploring the world of premium fragrances with OlfactiveEcho!** 🌸✨

- Environment variable protection
- Admin-only route protection

## 📱 Notification System

### Supported Channels
1. **Email** (Always Active)
   - Gmail integration with Nodemailer
   - HTML templates with order details
   - Fallback to Ethereal for testing

2. **SMS** (Optional - Twilio)
   - Order confirmations
   - Status updates
   - Requires phone verification

3. **WhatsApp** (Optional - Twilio)
   - Rich formatted messages
   - First 1,000 messages/month free
   - Better engagement than SMS

### User Preferences
Users can enable/disable each notification channel in their profile settings.

## 🌟 Default Credentials

After running `npm run seed`, use these credentials:

**Admin Account:**
- Email: `admin@olfactiveecho.com`
- Password: `AdminPass123!`

**Test Users:**
Create your own account via the registration page.

## 📝 Environment Setup Tips

### Gmail App Password
1. Enable 2-Factor Authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use this password in `EMAIL_PASS`

### MongoDB Atlas (Free Tier)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Add your IP to whitelist (or allow all: 0.0.0.0/0)
4. Create database user
5. Get connection string and update `MONGODB_URI`

### Twilio Setup (Optional)
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get Account SID and Auth Token
3. For SMS: Get a phone number
4. For WhatsApp: Use Twilio Sandbox number

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running: `mongod --version`
- Verify `.env` file exists and has correct values
- Ensure port 5000 is not in use

### Frontend won't connect to backend
- Verify backend is running on port 5000
- Check CORS settings in backend `.env`
- Clear browser cache and reload

### Database errors
- Run `npm run seed` to populate with sample data
- Check MongoDB connection string
- Ensure database name is correct

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Anish**
- GitHub: [@anish-off](https://github.com/anish-off)

---

**Built with ❤️ for fragrance enthusiasts** 🌸✨
