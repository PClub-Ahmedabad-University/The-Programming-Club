# Programming Club - Ahmedabad University

<p align="center">
  <img src="public/logo1.png" alt="P-Club Logo" width="150" style="display:inline-block; margin-right: 40px;"/>
  <img src="public/au-logo.png" alt="Ahmedabad University Logo" height="100" style="display:inline-block;"/>
</p>


The official website for the Programming Club at Ahmedabad University. This Next.js project provides an engaging experience for students and administrators, with features for user authentication, admin dashboard, and event management.

## Major Sections/Components/Routes

- **Pages:**
  - `/` (Home)
  - `/about-us` (About Us)
  - `/admin/dashboard` (Admin Dashboard)
  - `/admin/login` (Admin Login)
  - `/past-events` (Past Events)
  - `/users/login` (User Login)
  - `/users/sign-up` (User Sign Up)
  - `/events` (Events)
  - `/events/[id]` (Event Details)
  - `/contact-us` (Contact Us)
  - `/our-team` (Our Team)

- **Components:**
  - `Navbar`
  - `Footer`
  - `Hero`
  - `EventCard`
  - `UpcomingEvent`
  - `ContactUs`
  - `CodeTerminal`
  - `ClubHighlights`

- **API Routes:**
  - `/api/auth/login` (Login)
  - `/api/auth/register` (Register)
  - `/api/events/add` (Add Event)
  - `/api/events/get` (Get Events)
  - `/api/events/get/[id]` (Get Event by ID)
  - `/api/events/patch/[id]` (Update Event)
  - `/api/gallery/add` (Add Gallery Item)
  - `/api/gallery/delete/[id]` (Delete Gallery Item)
  - `/api/gallery/patch/[id]` (Update Gallery Item)
  - `/api/members/add` (Add Member)
  - `/api/members/delete` (Delete Member)
  - `/api/members/get` (Get Members)

## Design

Figma Design : https://www.figma.com/design/kHauIvxVeOb8diy8jO6jJd/Website?node-id=0-1&p=f

## 🚀 Features:

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
