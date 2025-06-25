# Programming Club | Ahmedabad University

## Modern Web Platform for the Programming Club.

<p align="center">
  <img src="public/logo1.png" alt="P-Club Logo" width="150" style="display:inline-block; margin-right: 40px;"/>
  <img src="public/au-logo.png" alt="Ahmedabad University Logo" height="100" style="display:inline-block;"/>
</p>

## Project Overview

The Programming Club at Ahmedabad University is a student-run organization dedicated to fostering a culture of coding, problem-solving, and technological innovation. This website serves as the digital hub for all club activities, member interactions, and event management.

**Purpose:** 
- Provide a centralized platform for club activities and member engagement
- Streamline event management and registration processes
- Showcase club achievements, projects, and member contributions
- Facilitate communication between club members, faculty, and the broader university community

**Target Audience:**
- Current and prospective club members
- Ahmedabad University students and faculty
- Alumni network

## Key Features

### User-Facing Features
- **Interactive Homepage**
  - Dynamic hero section with featured events
  - Upcoming events carousel
  - Quick links to important sections

- **Event Management**
  - Comprehensive event listings with filtering options
  - Detailed event pages with registration functionality
  - Calendar integration for important dates
  - Event reminders and notifications

- **Member Portal**
  - User registration and profile management
  - Event registration history
  - Achievement tracking

- **Gallery**
  - Photo and video gallery of past events
  - Categorized media collections
  - Social media integration

- **Team Section**
  - Current team members and their roles
  - Alumni network
  - Faculty advisors

### Administrative Features
- **Admin Dashboard**
  - User management system
  - Event creation and management
  - Analytics and reporting
  - Content management system

- **Authentication & Security**
  - Role-based access control (Admin, Member, Guest)
  - Secure password management
  - Email verification system
  - OTP-based authentication

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: 
  - Tailwind CSS 4 for utility-first styling
  - Styled Components for complex UI components
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Yup validation
- **Animations**: Framer Motion for smooth transitions
- **Icons**: lucide-react and react-icons
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: 
  - MongoDB with Mongoose ODM
  - Redis for caching and session management
- **Authentication**: 
  - JWT (JSON Web Tokens)
  - bcryptjs for password hashing
  - Email verification system
- **Email Service**: Nodemailer for transactional emails
- **File Storage**: Cloudinary integration for media handling

### Development Tools
- **Version Control**: Git with GitHub
- **Package Manager**: npm/yarn
- **Linting**: ESLint with custom configuration
- **Code Formatting**: Prettier
- **Environment Management**: .env files with next-env

## Project Structure

```
src/
├── app/                          # Next.js 13+ App Router - Contains the main application logic, including pages, layouts, and API routes.
│   ├── admin/                    # Admin interface
│   │   ├── dashboard/            # Admin dashboard
│   │   └── login/                # Admin authentication
│   │
│   ├── api/                     # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── events/               # Event management
│   │   ├── users/                # User management
│   │   ├── gallery/              # Media handling
│   │   └── ...
│   │
│   ├── events/                  # Public event pages
│   │   └── [id]/                 # Dynamic event pages
│   │
│   ├── users/                   # User account management
│   │   ├── login/                # User login
│   │   ├── sign-up/             # User registration
│   │   └── forget-password/      # Password recovery
│   │
│   ├── our-team/               # Team information
│   ├── gallery/                 # Media gallery
│   └── contact-us/              # Contact information
│
├── Components/                 # Reusable UI components
│   ├── common/                  # Common components (buttons, cards, etc.)
│   ├── layout/                  # Layout components
│   └── ...
│
├── Client Components/          # Client-side components
├── Styles/                      # Global styles and themes
├── lib/                         # Utility functions and helpers
└── public/                      # Static assets
    ├── images/                  # Image assets
    └── ...
```

**Directory Descriptions:**

-   `app`: Contains the main application logic, including pages, layouts, and API routes.
-   `Components`: Contains reusable UI components used throughout the application.
-   `Client Components`: Contains client-side components.
-   `Styles`: Contains global styles and themes.
-   `lib`: Contains utility functions and helpers.
-   `public`: Contains static assets such as images and fonts.

**Key Components:**

-   `Navbar`: The main navigation bar.
-   `Footer`: The footer section.
-   `EventCard`: A component for displaying event information.
-   `Hero`: The hero section on the homepage.

**Environment Variables:**

-   `MONGODB_URI`: The connection string for the MongoDB database.
-   `NEXTAUTH_SECRET`: The secret used for NextAuth.js.
-   `NEXTAUTH_URL`: The URL of the NextAuth.js deployment.
-   `SMTP_HOST`: The host of the SMTP server.
-   `SMTP_PORT`: The port of the SMTP server.
-   `SMTP_USER`: The username for the SMTP server.
-   `SMTP_PASSWORD`: The password for the SMTP server.
-   `SMTP_FROM`: The email address used to send emails.
-   `CLOUDINARY_CLOUD_NAME`: The name of the Cloudinary cloud.
-   `CLOUDINARY_API_KEY`: The API key for Cloudinary.
-   `CLOUDINARY_API_SECRET`: The API secret for Cloudinary.
-   `REDIS_URL`: The URL for the Redis server.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm (v9+) or yarn (v1.22+)
- MongoDB Atlas account or local MongoDB instance
- Redis server (for caching and sessions)
- SMTP server (or Mailtrap for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PClub-Ahmedabad-University/The-Programming-Club.git
   cd The-Programming-Club
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Environment Setup**
   - Create a `.env.local` file in the root directory
   - Copy the contents from `.env.example` to `.env.local`
   - Update the environment variables with your configuration:
     ```
     MONGODB_URI=your_mongodb_connection_string
     NEXTAUTH_SECRET=your_nextauth_secret
     NEXTAUTH_URL=http://localhost:3000
     SMTP_HOST=your_smtp_host
     SMTP_PORT=587
     SMTP_USER=your_smtp_username
     SMTP_PASSWORD=your_smtp_password
     SMTP_FROM=your_email@example.com
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     REDIS_URL=your_redis_url
     ```

4. **Database Setup**
   - Ensure MongoDB is running locally or update the connection string to your MongoDB Atlas cluster
   - Run database migrations if any

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   - Visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

The application is configured for deployment on Vercel, but can be deployed to any Node.js hosting platform that supports Next.js.

### Vercel Deployment

1. Push your code to a GitHub repository
2. Import the repository to Vercel
3. Add the required environment variables
4. Deploy!

## Acknowledgments

- Ahmedabad University for their support
- All the contributors who have helped build this platform

##  Developer Credits
Made with ❤️ by members of the Programming Club:

- [Jay Shah](https://github.com/Jay-1409)
- [Deep Patel](https://github.com/DataWizard1631)
- [Drumil Bhati](https://github.com/drumilbhati)
- [Meet Gandhi](https://github.com/meet-dharmesh-gandhi)
- [Kushal Rathod](https://github.com/KushalXCoder)
- [Subrat Jain](https://github.com/CodexKnight-ai)

## Contact

For any queries or support, please contact the development team at [programming.club@ahduni.edu.in](mailto:programming.club@ahduni.edu.in)
