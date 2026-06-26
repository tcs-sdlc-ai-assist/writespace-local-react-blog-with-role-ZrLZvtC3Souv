import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage.jsx';
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

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getSession.mockReturnValue(null);
  });

  // --- Form rendering ---

  describe('form rendering', () => {
    it('renders the WriteSpace logo', () => {
      renderRegisterPage();
      expect(screen.getByText('WriteSpace')).toBeInTheDocument();
    });

    it('renders the Create your account heading', () => {
      renderRegisterPage();
      expect(screen.getByText('Create your account')).toBeInTheDocument();
    });

    it('renders the join description text', () => {
      renderRegisterPage();
      expect(screen.getByText('Join WriteSpace and start writing')).toBeInTheDocument();
    });

    it('renders the display name input field', () => {
      renderRegisterPage();
      const displayNameInput = screen.getByLabelText('Display Name');
      expect(displayNameInput).toBeInTheDocument();
      expect(displayNameInput).toHaveAttribute('type', 'text');
    });

    it('renders the username input field', () => {
      renderRegisterPage();
      const usernameInput = screen.getByLabelText('Username');
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute('type', 'text');
    });

    it('renders the password input field', () => {
      renderRegisterPage();
      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('renders the confirm password input field', () => {
      renderRegisterPage();
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('renders the Register submit button', () => {
      renderRegisterPage();
      const registerButton = screen.getByRole('button', { name: /Register/i });
      expect(registerButton).toBeInTheDocument();
      expect(registerButton).toHaveAttribute('type', 'submit');
    });

    it('renders a link to the login page', () => {
      renderRegisterPage();
      const loginLink = screen.getByRole('link', { name: /Login/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('renders the "Already have an account?" text', () => {
      renderRegisterPage();
      expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
    });

    it('renders a link to the landing page via WriteSpace logo', () => {
      renderRegisterPage();
      const logoLink = screen.getByRole('link', { name: /WriteSpace/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  // --- Successful registration ---

  describe('successful registration', () => {
    it('redirects to /blogs on successful registration', async () => {
      const user = userEvent.setup();
      const userSession = {
        userId: 'u1',
        username: 'newuser',
        displayName: 'New User',
        role: 'user',
      };
      auth.register.mockReturnValue({ success: true, session: userSession });

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'New User');
      await user.type(screen.getByLabelText('Username'), 'newuser');
      await user.type(screen.getByLabelText('Password'), 'newpass');
      await user.type(screen.getByLabelText('Confirm Password'), 'newpass');
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(auth.register).toHaveBeenCalledWith('New User', 'newuser', 'newpass');
      expect(mockedNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });

    it('calls register with correct arguments', async () => {
      const user = userEvent.setup();
      auth.register.mockReturnValue({
        success: true,
        session: { userId: 'u2', username: 'testuser', displayName: 'Test User', role: 'user' },
      });

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'Test User');
      await user.type(screen.getByLabelText('Username'), 'testuser');
      await user.type(screen.getByLabelText('Password'), 'mypassword');
      await user.type(screen.getByLabelText('Confirm Password'), 'mypassword');
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(auth.register).toHaveBeenCalledWith('Test User', 'testuser', 'mypassword');
    });
  });

  // --- Validation: required fields ---

  describe('validation: required fields', () => {
    it('displays error when all fields are empty', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(screen.getByText('All fields are required.')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
      expect(mockedNavigate).not.toHaveBeenCalled();
    });

    it('displays error when display name is empty', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText('Username'), 'newuser');
      await user.type(screen.getByLabelText('Password'), 'newpass');
      await user.type(screen.getByLabelText('Confirm Password'), 'newpass');
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(screen.getByText('All fields are required.')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
    });

    it('displays error when username is empty', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'New User');
      await user.type(screen.getByLabelText('Password'), 'newpass');
      await user.type(screen.getByLabelText('Confirm Password'), 'newpass');
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(screen.getByText('All fields are required.')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
    });

    it('displays error when password is empty', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'New User');
      await user.type(screen.getByLabelText('Username'), 'newuser');
      await user.type(screen.getByLabelText('Confirm Password'), 'newpass');
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(screen.getByText('All fields are required.')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
    });

    it('displays error when confirm password is empty', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'New User');
      await user.type(screen.getByLabelText('Username'), 'newuser');
      await user.type(screen.getByLabelText('Password'), 'newpass');
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(screen.getByText('All fields are required.')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
    });
  });

  // --- Validation: password match ---

  describe('validation: password match', () => {
    it('displays error when passwords do not match', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'New User');
      await user.type(screen.getByLabelText('Username'), 'newuser');
      await user.type(screen.getByLabelText('Password'), 'password1');
      await user.type(screen.getByLabelText('Confirm Password'), 'password2');
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });

  // --- Failed registration ---

  describe('failed registration', () => {
    it('displays error message when username already exists', async () => {
      const user = userEvent.setup();
      auth.register.mockReturnValue({ success: false, error: 'Username already exists.' });

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'New User');
      await user.type(screen.getByLabelText('Username'), 'admin');
      await user.type(screen.getByLabelText('Password'), 'somepass');
      await user.type(screen.getByLabelText('Confirm Password'), 'somepass');
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(screen.getByText('Username already exists.')).toBeInTheDocument();
      expect(mockedNavigate).not.toHaveBeenCalled();
    });

    it('displays generic error message when no error string is provided', async () => {
      const user = userEvent.setup();
      auth.register.mockReturnValue({ success: false });

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'New User');
      await user.type(screen.getByLabelText('Username'), 'newuser');
      await user.type(screen.getByLabelText('Password'), 'newpass');
      await user.type(screen.getByLabelText('Confirm Password'), 'newpass');
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(screen.getByText('Registration failed.')).toBeInTheDocument();
    });

    it('clears previous error on new submission attempt', async () => {
      const user = userEvent.setup();
      auth.register
        .mockReturnValueOnce({ success: false, error: 'Username already exists.' })
        .mockReturnValueOnce({
          success: true,
          session: { userId: 'u1', username: 'newuser', displayName: 'New User', role: 'user' },
        });

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'New User');
      await user.type(screen.getByLabelText('Username'), 'admin');
      await user.type(screen.getByLabelText('Password'), 'somepass');
      await user.type(screen.getByLabelText('Confirm Password'), 'somepass');
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(screen.getByText('Username already exists.')).toBeInTheDocument();

      await user.clear(screen.getByLabelText('Display Name'));
      await user.clear(screen.getByLabelText('Username'));
      await user.clear(screen.getByLabelText('Password'));
      await user.clear(screen.getByLabelText('Confirm Password'));
      await user.type(screen.getByLabelText('Display Name'), 'New User');
      await user.type(screen.getByLabelText('Username'), 'newuser');
      await user.type(screen.getByLabelText('Password'), 'newpass');
      await user.type(screen.getByLabelText('Confirm Password'), 'newpass');
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(screen.queryByText('Username already exists.')).not.toBeInTheDocument();
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

      renderRegisterPage();

      expect(mockedNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });

    it('redirects authenticated admin user to /admin', () => {
      auth.getSession.mockReturnValue({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });

      renderRegisterPage();

      expect(mockedNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });
  });

  // --- Input interaction ---

  describe('input interaction', () => {
    it('updates display name input value when typing', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const displayNameInput = screen.getByLabelText('Display Name');
      await user.type(displayNameInput, 'My Name');
      expect(displayNameInput).toHaveValue('My Name');
    });

    it('updates username input value when typing', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const usernameInput = screen.getByLabelText('Username');
      await user.type(usernameInput, 'myuser');
      expect(usernameInput).toHaveValue('myuser');
    });

    it('updates password input value when typing', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'mypass');
      expect(passwordInput).toHaveValue('mypass');
    });

    it('updates confirm password input value when typing', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      await user.type(confirmPasswordInput, 'mypass');
      expect(confirmPasswordInput).toHaveValue('mypass');
    });
  });
});