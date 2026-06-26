import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import * as auth from '../utils/auth.js';

vi.mock('../utils/auth.js', () => ({
  getSession: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../utils/storage.js', () => ({
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

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getSession.mockReturnValue(null);
  });

  // --- Form rendering ---

  describe('form rendering', () => {
    it('renders the WriteSpace logo', () => {
      renderLoginPage();
      expect(screen.getByText('WriteSpace')).toBeInTheDocument();
    });

    it('renders the Welcome back heading', () => {
      renderLoginPage();
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    it('renders the sign in description text', () => {
      renderLoginPage();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    it('renders the username input field', () => {
      renderLoginPage();
      const usernameInput = screen.getByLabelText('Username');
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute('type', 'text');
    });

    it('renders the password input field', () => {
      renderLoginPage();
      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('renders the Login submit button', () => {
      renderLoginPage();
      const loginButton = screen.getByRole('button', { name: /Login/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveAttribute('type', 'submit');
    });

    it('renders a link to the register page', () => {
      renderLoginPage();
      const registerLink = screen.getByRole('link', { name: /Register/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('renders the "Don\'t have an account?" text', () => {
      renderLoginPage();
      expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    });

    it('renders a link to the landing page via WriteSpace logo', () => {
      renderLoginPage();
      const logoLink = screen.getByRole('link', { name: /WriteSpace/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  // --- Successful login ---

  describe('successful login', () => {
    it('redirects regular user to /blogs on successful login', async () => {
      const user = userEvent.setup();
      const userSession = {
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      auth.login.mockReturnValue({ success: true, session: userSession });

      renderLoginPage();

      await user.type(screen.getByLabelText('Username'), 'testuser');
      await user.type(screen.getByLabelText('Password'), 'testpass');
      await user.click(screen.getByRole('button', { name: /Login/i }));

      expect(auth.login).toHaveBeenCalledWith('testuser', 'testpass');
      expect(mockedNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });

    it('redirects admin user to /admin on successful login', async () => {
      const user = userEvent.setup();
      const adminSession = {
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      auth.login.mockReturnValue({ success: true, session: adminSession });

      renderLoginPage();

      await user.type(screen.getByLabelText('Username'), 'admin');
      await user.type(screen.getByLabelText('Password'), 'adminpass');
      await user.click(screen.getByRole('button', { name: /Login/i }));

      expect(auth.login).toHaveBeenCalledWith('admin', 'adminpass');
      expect(mockedNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });
  });

  // --- Failed login ---

  describe('failed login', () => {
    it('displays error message on failed login', async () => {
      const user = userEvent.setup();
      auth.login.mockReturnValue({ success: false, error: 'Invalid username or password.' });

      renderLoginPage();

      await user.type(screen.getByLabelText('Username'), 'wronguser');
      await user.type(screen.getByLabelText('Password'), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /Login/i }));

      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      expect(mockedNavigate).not.toHaveBeenCalled();
    });

    it('displays generic error message when no error string is provided', async () => {
      const user = userEvent.setup();
      auth.login.mockReturnValue({ success: false });

      renderLoginPage();

      await user.type(screen.getByLabelText('Username'), 'user');
      await user.type(screen.getByLabelText('Password'), 'pass');
      await user.click(screen.getByRole('button', { name: /Login/i }));

      expect(screen.getByText('Login failed.')).toBeInTheDocument();
    });

    it('clears previous error on new submission attempt', async () => {
      const user = userEvent.setup();
      auth.login
        .mockReturnValueOnce({ success: false, error: 'Invalid username or password.' })
        .mockReturnValueOnce({ success: true, session: { userId: 'u1', username: 'testuser', displayName: 'Test User', role: 'user' } });

      renderLoginPage();

      await user.type(screen.getByLabelText('Username'), 'wronguser');
      await user.type(screen.getByLabelText('Password'), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /Login/i }));

      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();

      await user.clear(screen.getByLabelText('Username'));
      await user.clear(screen.getByLabelText('Password'));
      await user.type(screen.getByLabelText('Username'), 'testuser');
      await user.type(screen.getByLabelText('Password'), 'testpass');
      await user.click(screen.getByRole('button', { name: /Login/i }));

      expect(screen.queryByText('Invalid username or password.')).not.toBeInTheDocument();
    });

    it('displays error when fields are empty', async () => {
      const user = userEvent.setup();
      auth.login.mockReturnValue({ success: false, error: 'All fields are required.' });

      renderLoginPage();

      await user.click(screen.getByRole('button', { name: /Login/i }));

      expect(auth.login).toHaveBeenCalledWith('', '');
      expect(screen.getByText('All fields are required.')).toBeInTheDocument();
    });
  });

  // --- Redirect already-authenticated users ---

  describe('redirect already-authenticated users', () => {
    it('redirects authenticated regular user to /blogs', () => {
      auth.getSession.mockReturnValue({
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });

      renderLoginPage();

      expect(mockedNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });

    it('redirects authenticated admin user to /admin', () => {
      auth.getSession.mockReturnValue({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });

      renderLoginPage();

      expect(mockedNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });
  });

  // --- Input interaction ---

  describe('input interaction', () => {
    it('updates username input value when typing', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      await user.type(usernameInput, 'myuser');
      expect(usernameInput).toHaveValue('myuser');
    });

    it('updates password input value when typing', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'mypass');
      expect(passwordInput).toHaveValue('mypass');
    });
  });
});