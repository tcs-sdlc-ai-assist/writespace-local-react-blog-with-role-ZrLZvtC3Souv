import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import * as auth from './utils/auth.js';

vi.mock('./utils/auth.js', () => ({
  getSession: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('./utils/storage.js', () => ({
  getPosts: vi.fn(() => []),
  getUsers: vi.fn(() => []),
  addPost: vi.fn(),
  updatePost: vi.fn(),
  removePost: vi.fn(),
  addUser: vi.fn(),
  removeUser: vi.fn(),
  getSession: vi.fn(() => null),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}));

function LandingPage() {
  return <div>Landing Page</div>;
}

function LoginPage() {
  return <div>Login Page</div>;
}

function RegisterPage() {
  return <div>Register Page</div>;
}

function Home() {
  return <div>Home Page</div>;
}

function WriteBlog() {
  return <div>Write Blog Page</div>;
}

function ReadBlog() {
  return <div>Read Blog Page</div>;
}

function AdminDashboard() {
  return <div>Admin Dashboard Page</div>;
}

function UserManagement() {
  return <div>User Management Page</div>;
}

function renderWithRouter(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <WriteBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <WriteBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <ProtectedRoute>
              <ReadBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getSession.mockReturnValue(null);
  });

  // --- Public routes ---

  describe('public routes', () => {
    it('renders the landing page at /', () => {
      renderWithRouter('/');
      expect(screen.getByText('Landing Page')).toBeInTheDocument();
    });

    it('renders the login page at /login', () => {
      renderWithRouter('/login');
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('renders the register page at /register', () => {
      renderWithRouter('/register');
      expect(screen.getByText('Register Page')).toBeInTheDocument();
    });
  });

  // --- Protected route redirects for unauthenticated users ---

  describe('protected route redirects for unauthenticated users', () => {
    it('redirects unauthenticated users from /blogs to /login', () => {
      auth.getSession.mockReturnValue(null);
      renderWithRouter('/blogs');
      expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /write to /login', () => {
      auth.getSession.mockReturnValue(null);
      renderWithRouter('/write');
      expect(screen.queryByText('Write Blog Page')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /edit/:id to /login', () => {
      auth.getSession.mockReturnValue(null);
      renderWithRouter('/edit/some-id');
      expect(screen.queryByText('Write Blog Page')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /blog/:id to /login', () => {
      auth.getSession.mockReturnValue(null);
      renderWithRouter('/blog/some-id');
      expect(screen.queryByText('Read Blog Page')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /admin to /login', () => {
      auth.getSession.mockReturnValue(null);
      renderWithRouter('/admin');
      expect(screen.queryByText('Admin Dashboard Page')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /admin/users to /login', () => {
      auth.getSession.mockReturnValue(null);
      renderWithRouter('/admin/users');
      expect(screen.queryByText('User Management Page')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  // --- Authenticated user access ---

  describe('authenticated user access', () => {
    const userSession = {
      userId: 'u1',
      username: 'testuser',
      displayName: 'Test User',
      role: 'user',
    };

    it('allows authenticated users to access /blogs', () => {
      auth.getSession.mockReturnValue(userSession);
      renderWithRouter('/blogs');
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('allows authenticated users to access /write', () => {
      auth.getSession.mockReturnValue(userSession);
      renderWithRouter('/write');
      expect(screen.getByText('Write Blog Page')).toBeInTheDocument();
    });

    it('allows authenticated users to access /edit/:id', () => {
      auth.getSession.mockReturnValue(userSession);
      renderWithRouter('/edit/post-1');
      expect(screen.getByText('Write Blog Page')).toBeInTheDocument();
    });

    it('allows authenticated users to access /blog/:id', () => {
      auth.getSession.mockReturnValue(userSession);
      renderWithRouter('/blog/post-1');
      expect(screen.getByText('Read Blog Page')).toBeInTheDocument();
    });
  });

  // --- Role-based access control ---

  describe('role-based access control', () => {
    const userSession = {
      userId: 'u1',
      username: 'testuser',
      displayName: 'Test User',
      role: 'user',
    };

    const adminSession = {
      userId: 'admin',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
    };

    it('redirects non-admin users from /admin to /blogs', () => {
      auth.getSession.mockReturnValue(userSession);
      renderWithRouter('/admin');
      expect(screen.queryByText('Admin Dashboard Page')).not.toBeInTheDocument();
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('redirects non-admin users from /admin/users to /blogs', () => {
      auth.getSession.mockReturnValue(userSession);
      renderWithRouter('/admin/users');
      expect(screen.queryByText('User Management Page')).not.toBeInTheDocument();
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('allows admin users to access /admin', () => {
      auth.getSession.mockReturnValue(adminSession);
      renderWithRouter('/admin');
      expect(screen.getByText('Admin Dashboard Page')).toBeInTheDocument();
    });

    it('allows admin users to access /admin/users', () => {
      auth.getSession.mockReturnValue(adminSession);
      renderWithRouter('/admin/users');
      expect(screen.getByText('User Management Page')).toBeInTheDocument();
    });

    it('allows admin users to access regular protected routes like /blogs', () => {
      auth.getSession.mockReturnValue(adminSession);
      renderWithRouter('/blogs');
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('allows admin users to access /write', () => {
      auth.getSession.mockReturnValue(adminSession);
      renderWithRouter('/write');
      expect(screen.getByText('Write Blog Page')).toBeInTheDocument();
    });
  });

  // --- Edge cases ---

  describe('edge cases', () => {
    it('renders landing page for authenticated users visiting /', () => {
      auth.getSession.mockReturnValue({
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
      renderWithRouter('/');
      expect(screen.getByText('Landing Page')).toBeInTheDocument();
    });

    it('renders login page for authenticated users visiting /login (page handles redirect internally)', () => {
      auth.getSession.mockReturnValue({
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
      renderWithRouter('/login');
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('renders register page for authenticated users visiting /register (page handles redirect internally)', () => {
      auth.getSession.mockReturnValue({
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
      renderWithRouter('/register');
      expect(screen.getByText('Register Page')).toBeInTheDocument();
    });
  });
});