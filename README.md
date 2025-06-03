# Programming Club - Ahmedabad University

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

The official website for the Programming Club at Ahmedabad University, built with modern web technologies to provide an engaging experience for students and administrators.

## Design

Figma Design : https://www.figma.com/design/kHauIvxVeOb8diy8jO6jJd/Website?node-id=0-1&p=f


## 🚀 Features

### User Features
- **Authentication System**
  - User registration and login
  - Forgot password

### Admin Features
- **Admin Dashboard**
  - Secure admin login

### Event Management
- Browse past events
- Event details and descriptions

## 🛠️ Technologies Used

- **Frontend**
  - Next.js 15 with App Router
  - React 19
  - Tailwind CSS 4
  - Motion for animations
  - lucide-react
  - react-icons
  - styled-components
  - tailwind-merge

- **Backend**
  - Next.js API Routes
  - MongoDB with Mongoose
  - JWT for authentication
  - bcryptjs
  - ioredis
  - jsonwebtoken
  - nodemailer
  - redis

## 📁 Project Structure

```
src/app/
├── admin/
│   └── login/         # Admin authentication
├── past-events/       # Event listings and details
├── users/
│   ├── login/         # User login
│   └── sign-up/       # User registration
├── Components/        # Reusable UI components
└── Client Components/ # Client-side components
├── events/            # Event pages
│   └── [id]/          # Dynamic event pages
├── api/               # API routes
│   ├── auth/          # Authentication routes
│   │   ├── forgot-password/ # Forgot password route
│   │   ├── login/          # Login route
│   │   └── register/       # Register route
│   ├── controllers/   # API controllers
│   ├── lib/           # API library
│   ├── models/        # API models
│   └── otp/           # OTP routes
└── Styles/           # Styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas or local MongoDB instance

## 🎨 Design System

The application uses a modern, responsive design with:

- Dark theme with primary color scheme (#0C1224)
- Glassmorphism UI elements
- Smooth animations and transitions
- Mobile-first approach


## 🙏 Acknowledgments

- Ahmedabad University for their support
- All contributors and club members
