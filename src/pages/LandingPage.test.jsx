import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import * as auth from '../utils/auth.js';
import * as storage from '../utils/storage.js';

vi.mock('../utils/auth.js', () => ({
  getSession: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../utils/storage.js', () => ({
  getPosts: vi.fn(),
  getUsers: vi.fn(),
  addPost: vi.fn(),
  updatePost: vi.fn(),
  removePost: vi.fn(),
  addUser: vi.fn(),
  removeUser: vi.fn(),
  getSession: vi.fn(),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}));

function renderLandingPage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <LandingPage />
    </MemoryRouter>
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getSession.mockReturnValue(null);
    storage.getPosts.mockReturnValue([]);
    storage.getUsers.mockReturnValue([]);
  });

  // --- Hero Section ---

  describe('hero section', () => {
    it('renders the hero heading with WriteSpace', () => {
      renderLandingPage();
      expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
      expect(screen.getByText('WriteSpace', { selector: 'span.text-yellow-300' })).toBeInTheDocument();
    });

    it('renders the hero description text', () => {
      renderLandingPage();
      expect(
        screen.getByText(/A simple, beautiful platform to write, share, and manage blog posts/i)
      ).toBeInTheDocument();
    });
  });

  // --- CTA buttons for guests ---

  describe('CTA buttons for guests', () => {
    it('renders Get Started and Login buttons when not authenticated', () => {
      auth.getSession.mockReturnValue(null);
      renderLandingPage();
      const getStartedLinks = screen.getAllByRole('link', { name: /Get Started/i });
      expect(getStartedLinks.length).toBeGreaterThanOrEqual(1);
      const loginLinks = screen.getAllByRole('link', { name: /Login/i });
      expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('Get Started hero button links to /register', () => {
      auth.getSession.mockReturnValue(null);
      renderLandingPage();
      const heroSection = screen.getByText(/Welcome to/i).closest('section');
      const getStartedLink = heroSection.querySelector('a[href="/register"]');
      expect(getStartedLink).toBeInTheDocument();
      expect(getStartedLink.textContent).toMatch(/Get Started/i);
    });

    it('Login hero button links to /login', () => {
      auth.getSession.mockReturnValue(null);
      renderLandingPage();
      const heroSection = screen.getByText(/Welcome to/i).closest('section');
      const loginLink = heroSection.querySelector('a[href="/login"]');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.textContent).toMatch(/Login/i);
    });
  });

  // --- CTA buttons for authenticated users ---

  describe('CTA buttons for authenticated users', () => {
    it('renders Go to Dashboard button for authenticated regular user', () => {
      auth.getSession.mockReturnValue({
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
      renderLandingPage();
      const dashboardLink = screen.getByRole('link', { name: /Go to Dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/blogs');
    });

    it('renders Go to Dashboard button linking to /admin for admin user', () => {
      auth.getSession.mockReturnValue({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
      renderLandingPage();
      const dashboardLink = screen.getByRole('link', { name: /Go to Dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/admin');
    });

    it('does not render Get Started or Login hero buttons when authenticated', () => {
      auth.getSession.mockReturnValue({
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
      renderLandingPage();
      const heroSection = screen.getByText(/Welcome to/i).closest('section');
      const getStartedLink = heroSection.querySelector('a[href="/register"]');
      const loginLink = heroSection.querySelector('a[href="/login"]');
      expect(getStartedLink).toBeNull();
      expect(loginLink).toBeNull();
    });
  });

  // --- Features Section ---

  describe('features section', () => {
    it('renders the Why WriteSpace heading', () => {
      renderLandingPage();
      expect(screen.getByText('Why WriteSpace?')).toBeInTheDocument();
    });

    it('renders all three feature cards', () => {
      renderLandingPage();
      expect(screen.getByText('Write & Publish')).toBeInTheDocument();
      expect(screen.getByText('Role-Based Access')).toBeInTheDocument();
      expect(screen.getByText('Instant & Local')).toBeInTheDocument();
    });

    it('renders feature descriptions', () => {
      renderLandingPage();
      expect(
        screen.getByText(/Create beautiful blog posts with our simple editor/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Admins manage everything/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/No server needed/i)
      ).toBeInTheDocument();
    });

    it('renders feature icons', () => {
      renderLandingPage();
      expect(screen.getByText('✍️')).toBeInTheDocument();
      expect(screen.getByText('🔒')).toBeInTheDocument();
      expect(screen.getByText('⚡')).toBeInTheDocument();
    });
  });

  // --- Latest Posts Section ---

  describe('latest posts section', () => {
    it('renders the Latest Posts heading', () => {
      renderLandingPage();
      expect(screen.getByText('Latest Posts')).toBeInTheDocument();
    });

    it('renders empty state message when no posts exist', () => {
      storage.getPosts.mockReturnValue([]);
      renderLandingPage();
      expect(
        screen.getByText(/No posts yet. Be the first to write something!/i)
      ).toBeInTheDocument();
    });

    it('renders Get Started link in empty state for guests', () => {
      auth.getSession.mockReturnValue(null);
      storage.getPosts.mockReturnValue([]);
      renderLandingPage();
      const latestPostsSection = screen.getByText('Latest Posts').closest('section');
      const getStartedLink = latestPostsSection.querySelector('a[href="/register"]');
      expect(getStartedLink).toBeInTheDocument();
    });

    it('does not render Get Started link in empty state for authenticated users', () => {
      auth.getSession.mockReturnValue({
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
      storage.getPosts.mockReturnValue([]);
      renderLandingPage();
      const latestPostsSection = screen.getByText('Latest Posts').closest('section');
      const getStartedLink = latestPostsSection.querySelector('a[href="/register"]');
      expect(getStartedLink).toBeNull();
    });

    it('renders up to 3 latest posts sorted by newest first', () => {
      const posts = [
        { id: '1', title: 'First Post', content: 'Content 1', authorId: 'u1', authorName: 'User 1', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', title: 'Second Post', content: 'Content 2', authorId: 'u2', authorName: 'User 2', createdAt: '2024-02-01T00:00:00.000Z' },
        { id: '3', title: 'Third Post', content: 'Content 3', authorId: 'u1', authorName: 'User 1', createdAt: '2024-03-01T00:00:00.000Z' },
        { id: '4', title: 'Fourth Post', content: 'Content 4', authorId: 'u2', authorName: 'User 2', createdAt: '2024-04-01T00:00:00.000Z' },
      ];
      storage.getPosts.mockReturnValue(posts);
      renderLandingPage();

      expect(screen.getByText('Fourth Post')).toBeInTheDocument();
      expect(screen.getByText('Third Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
      expect(screen.queryByText('First Post')).not.toBeInTheDocument();
    });

    it('renders fewer than 3 posts when fewer exist', () => {
      const posts = [
        { id: '1', title: 'Only Post', content: 'Content 1', authorId: 'u1', authorName: 'User 1', createdAt: '2024-01-01T00:00:00.000Z' },
      ];
      storage.getPosts.mockReturnValue(posts);
      renderLandingPage();

      expect(screen.getByText('Only Post')).toBeInTheDocument();
    });

    it('renders exactly 3 posts when exactly 3 exist', () => {
      const posts = [
        { id: '1', title: 'Post A', content: 'Content A', authorId: 'u1', authorName: 'User 1', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', title: 'Post B', content: 'Content B', authorId: 'u2', authorName: 'User 2', createdAt: '2024-02-01T00:00:00.000Z' },
        { id: '3', title: 'Post C', content: 'Content C', authorId: 'u1', authorName: 'User 1', createdAt: '2024-03-01T00:00:00.000Z' },
      ];
      storage.getPosts.mockReturnValue(posts);
      renderLandingPage();

      expect(screen.getByText('Post A')).toBeInTheDocument();
      expect(screen.getByText('Post B')).toBeInTheDocument();
      expect(screen.getByText('Post C')).toBeInTheDocument();
    });

    it('does not show empty state message when posts exist', () => {
      const posts = [
        { id: '1', title: 'A Post', content: 'Content', authorId: 'u1', authorName: 'User 1', createdAt: '2024-01-01T00:00:00.000Z' },
      ];
      storage.getPosts.mockReturnValue(posts);
      renderLandingPage();

      expect(
        screen.queryByText(/No posts yet. Be the first to write something!/i)
      ).not.toBeInTheDocument();
    });
  });

  // --- Footer ---

  describe('footer', () => {
    it('renders the WriteSpace brand in the footer', () => {
      renderLandingPage();
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
      expect(footer.textContent).toContain('WriteSpace');
    });

    it('renders copyright text with current year', () => {
      renderLandingPage();
      const currentYear = new Date().getFullYear().toString();
      const footer = document.querySelector('footer');
      expect(footer.textContent).toContain(currentYear);
      expect(footer.textContent).toContain('All rights reserved');
    });

    it('renders footer navigation links', () => {
      renderLandingPage();
      const footer = document.querySelector('footer');
      const blogsLink = footer.querySelector('a[href="/blogs"]');
      const loginLink = footer.querySelector('a[href="/login"]');
      const registerLink = footer.querySelector('a[href="/register"]');
      expect(blogsLink).toBeInTheDocument();
      expect(loginLink).toBeInTheDocument();
      expect(registerLink).toBeInTheDocument();
    });
  });

  // --- PublicNavbar ---

  describe('public navbar', () => {
    it('renders the WriteSpace logo in the navbar', () => {
      renderLandingPage();
      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
      expect(nav.textContent).toContain('WriteSpace');
    });

    it('renders Login and Get Started in navbar for guests', () => {
      auth.getSession.mockReturnValue(null);
      renderLandingPage();
      const nav = document.querySelector('nav');
      const loginLink = nav.querySelector('a[href="/login"]');
      const registerLink = nav.querySelector('a[href="/register"]');
      expect(loginLink).toBeInTheDocument();
      expect(registerLink).toBeInTheDocument();
    });

    it('renders Dashboard link in navbar for authenticated users', () => {
      auth.getSession.mockReturnValue({
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
      renderLandingPage();
      const nav = document.querySelector('nav');
      const dashboardLink = nav.querySelector('a[href="/blogs"]');
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink.textContent).toMatch(/Dashboard/i);
    });

    it('renders Dashboard link to /admin in navbar for admin users', () => {
      auth.getSession.mockReturnValue({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
      renderLandingPage();
      const nav = document.querySelector('nav');
      const dashboardLink = nav.querySelector('a[href="/admin"]');
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink.textContent).toMatch(/Dashboard/i);
    });
  });
});