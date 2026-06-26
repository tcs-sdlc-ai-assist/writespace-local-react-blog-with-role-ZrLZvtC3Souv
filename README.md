# WriteSpace

A simple, beautiful blogging platform built entirely in the browser. No servers, no databases — just you and your words. All data is persisted in localStorage for instant, offline-capable performance.

## Features

- **Public Landing Page** — Hero section with gradient background, feature cards, latest posts preview, and footer with navigation links
- **Authentication** — Login and registration with session persistence via localStorage; hard-coded admin account (`admin` / `adminpass`)
- **Role-Based Access Control** — Admin and user roles with route protection; admins access Dashboard and User Management, users manage their own content
- **Blog CRUD with Ownership** — Create, read, edit, and delete blog posts; ownership enforcement ensures users can only modify their own posts while admins can modify any post
- **Admin Dashboard** — Overview stats (total posts, total users, admin posts, user posts), quick-action buttons, and recent posts section
- **User Management** — Admin-only page to create and delete user accounts with username uniqueness validation and cascade deletion of user posts
- **Responsive UI** — Fully responsive design with Tailwind CSS utility classes, mobile-first layout, and consistent indigo/purple/pink gradient color scheme
- **localStorage Persistence** — Namespaced keys with safe JSON serialization/deserialization and graceful error fallbacks

## Tech Stack

- **[React 18](https://react.dev/)** — UI library
- **[Vite 5](https://vitejs.dev/)** — Build tool and dev server
- **[React Router v6](https://reactrouter.com/)** — Client-side routing
- **[Tailwind CSS 3](https://tailwindcss.com/)** — Utility-first CSS framework
- **[PropTypes](https://www.npmjs.com/package/prop-types)** — Runtime prop type checking
- **[Vitest](https://vitest.dev/)** — Unit and component testing
- **[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)** — React component testing utilities

## Folder Structure

```
writespace/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration with React plugin
├── vitest.config.js            # Vitest configuration with jsdom environment
├── tailwind.config.js          # Tailwind CSS content paths and theme
├── postcss.config.js           # PostCSS plugins (Tailwind + Autoprefixer)
├── vercel.json                 # Vercel SPA rewrite rules
├── src/
│   ├── main.jsx                # React DOM root render
│   ├── App.jsx                 # Root component with route definitions
│   ├── App.test.jsx            # Route integration tests
│   ├── index.css               # Tailwind base/components/utilities imports
│   ├── setupTests.js           # Test setup (@testing-library/jest-dom)
│   ├── components/
│   │   ├── Avatar.jsx          # Role-distinct avatar component (👑 admin, 📖 user)
│   │   ├── BlogCard.jsx        # Reusable blog post card with excerpt and edit icon
│   │   ├── Navbar.jsx          # Authenticated navigation bar
│   │   ├── ProtectedRoute.jsx  # Route guard for authentication and role-based access
│   │   ├── PublicNavbar.jsx     # Public navigation bar for guests
│   │   ├── StatCard.jsx        # Reusable stat card for admin dashboard
│   │   └── UserRow.jsx         # User list item with delete confirmation
│   ├── pages/
│   │   ├── AdminDashboard.jsx  # Admin overview dashboard
│   │   ├── Home.jsx            # Authenticated blog list page
│   │   ├── LandingPage.jsx     # Public landing page
│   │   ├── LandingPage.test.jsx
│   │   ├── LoginPage.jsx       # Login form page
│   │   ├── LoginPage.test.jsx
│   │   ├── ReadBlog.jsx        # Single blog post reading view
│   │   ├── RegisterPage.jsx    # Registration form page
│   │   ├── RegisterPage.test.jsx
│   │   ├── UserManagement.jsx  # Admin user management page
│   │   └── WriteBlog.jsx       # Blog post create/edit form page
│   └── utils/
│       ├── auth.js             # Authentication logic (login, register, logout, getSession)
│       ├── auth.test.js
│       ├── storage.js          # localStorage CRUD utilities (posts, users, session)
│       └── storage.test.js
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (included with Node.js)

### Installation

```bash
git clone <repository-url>
cd writespace
npm install
```

### Development

Start the Vite development server with hot module replacement:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Build

Create an optimized production build:

```bash
npm run build
```

Output is written to the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Testing

Run all tests once:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

## Default Accounts

| Username | Password    | Role  |
|----------|-------------|-------|
| `admin`  | `adminpass` | Admin |

Additional user accounts can be created via the registration page or the admin User Management page.

## localStorage Schema

All data is stored in the browser's localStorage under namespaced keys:

### `writespace_posts`

Array of post objects:

```json
[
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "authorId": "string",
    "authorName": "string",
    "createdAt": "ISO 8601 string",
    "updatedAt": "ISO 8601 string (optional)"
  }
]
```

### `writespace_users`

Array of user objects (does not include the hard-coded admin):

```json
[
  {
    "id": "string",
    "displayName": "string",
    "username": "string",
    "password": "string",
    "role": "user",
    "createdAt": "ISO 8601 string"
  }
]
```

### `writespace_session`

Current session object or `null`:

```json
{
  "userId": "string",
  "username": "string",
  "displayName": "string",
  "role": "admin | user"
}
```

## Deployment

WriteSpace is configured for deployment on [Vercel](https://vercel.com/) as a static single-page application.

The `vercel.json` file includes a catch-all rewrite rule that directs all routes to `index.html`, enabling client-side routing via React Router:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

To deploy:

1. Push the repository to GitHub (or another Git provider)
2. Import the project in the Vercel dashboard
3. Vercel will auto-detect the Vite framework and apply the correct build settings
4. The app will be live at your Vercel project URL

For other static hosting providers, ensure all routes are rewritten to `index.html` to support client-side routing.

## License

This is a private project. All rights reserved.