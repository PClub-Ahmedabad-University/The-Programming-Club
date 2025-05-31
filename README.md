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
  - Secure password hashing with bcrypt
  - JWT-based authentication

### Admin Features
- **Admin Dashboard**
  - Secure admin login
  - Event management
  - User management

### Event Management
- Browse past events
- Event details and descriptions
- Responsive event cards with animations

## 🛠️ Technologies Used

- **Frontend**
  - Next.js 15 with App Router
  - React 19
  - Tailwind CSS 4
  - Motion for animations

- **Backend**
  - Next.js API Routes
  - MongoDB with Mongoose
  - JWT for authentication

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
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas or local MongoDB instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PClub-Ahmedabad-University/The-Programming-Club.git
   cd The-Programming-Club
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Design System

The application uses a modern, responsive design with:

- Dark theme with primary color scheme (#0C1224)
- Glassmorphism UI elements
- Smooth animations and transitions
- Mobile-first approach

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Ahmedabad University for their support
- All contributors and club members
