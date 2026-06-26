# Changelog

All notable changes to the WriteSpace project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-01

### Added

- **Public Landing Page**
  - Hero section with gradient background and animated decorative elements
  - Feature cards highlighting Write & Publish, Role-Based Access, and Instant & Local capabilities
  - Latest posts preview section displaying up to three newest blog posts
  - Footer with navigation links and copyright notice
  - Context-aware CTAs for guests (Get Started, Login) and authenticated users (Go to Dashboard)

- **Authentication**
  - Login page with centered card UI and gradient background
  - Registration page with display name, username, password, and confirm password fields
  - Hard-coded admin account (username: `admin`, password: `adminpass`)
  - Session persistence via localStorage
  - Automatic redirect for already-authenticated users visiting login or register pages
  - Inline error messages for validation failures and incorrect credentials

- **Role-Based Access Control**
  - ProtectedRoute component enforcing authentication on private routes
  - Admin-only route protection redirecting non-admin users to /blogs
  - Role-aware navigation bars (PublicNavbar for guests, Navbar for authenticated users)
  - Admin users see Dashboard and Users links in the navigation bar

- **Blog CRUD with Ownership**
  - Create new blog posts at /write with title and content fields
  - Edit existing posts at /edit/:id with pre-populated form fields
  - Full blog post reading view at /blog/:id with author info and formatted date
  - Delete posts with browser confirmation dialog
  - Ownership enforcement: users can only edit/delete their own posts, admins can edit/delete any post
  - Character counter for post content
  - BlogCard component with truncated excerpt, author avatar, date, and conditional edit icon

- **Admin Dashboard**
  - Gradient banner header with overview title
  - Four stat cards displaying total posts, total users, admin posts, and user posts
  - Quick-action buttons for writing a post and managing users
  - Recent posts section showing the five newest posts

- **User Management**
  - Admin-only user management page at /admin/users
  - Create new user form with display name, username, and password fields
  - Username uniqueness validation against existing users and hard-coded admin
  - User list displaying all users with avatar, display name, username, role badge, and creation date
  - User deletion with confirmation dialog via UserRow component
  - Cascade deletion removing all posts authored by a deleted user
  - Protection against deleting the hard-coded admin account and self-deletion

- **localStorage Persistence**
  - Posts, users, and session data stored in localStorage under namespaced keys
  - Safe JSON serialization and deserialization with error fallbacks
  - Graceful handling of localStorage unavailability and quota exceeded errors

- **Responsive Tailwind UI**
  - Fully responsive design using Tailwind CSS utility classes
  - Mobile-first layout with sm:, md:, and lg: responsive breakpoints
  - Consistent color scheme with indigo, purple, and pink gradients
  - Hover and transition effects on interactive elements
  - Role-distinct avatars (👑 for admin, 📖 for user)

- **Vercel Deployment**
  - Vercel configuration with SPA rewrite rules for client-side routing
  - Vite build setup with React plugin

- **Testing**
  - Unit tests for storage utilities (posts, users, session CRUD operations)
  - Unit tests for authentication logic (login, register, logout, getSession)
  - Component tests for LandingPage, LoginPage, and RegisterPage
  - Route integration tests verifying public access, authentication redirects, and role-based access control
  - Vitest configuration with jsdom environment and @testing-library/react