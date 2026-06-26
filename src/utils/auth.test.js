import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login, register, logout, getSession } from './auth.js';
import * as storage from './storage.js';

vi.mock('./storage.js', () => ({
  getUsers: vi.fn(),
  addUser: vi.fn(),
  getSession: vi.fn(),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}));

describe('auth.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.getUsers.mockReturnValue([]);
    storage.getSession.mockReturnValue(null);
  });

  // --- login ---

  describe('login', () => {
    it('returns error when username is empty', () => {
      const result = login('', 'password');
      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required.');
      expect(storage.setSession).not.toHaveBeenCalled();
    });

    it('returns error when password is empty', () => {
      const result = login('admin', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required.');
      expect(storage.setSession).not.toHaveBeenCalled();
    });

    it('returns error when both fields are empty', () => {
      const result = login('', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required.');
    });

    it('logs in with hard-coded admin credentials', () => {
      const result = login('admin', 'adminpass');
      expect(result.success).toBe(true);
      expect(result.session).toEqual({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
      expect(storage.setSession).toHaveBeenCalledWith({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
    });

    it('rejects admin login with wrong password', () => {
      const result = login('admin', 'wrongpassword');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password.');
      expect(storage.setSession).not.toHaveBeenCalled();
    });

    it('logs in with a localStorage user', () => {
      const mockUser = {
        id: 'u1',
        displayName: 'Test User',
        username: 'testuser',
        password: 'testpass',
        role: 'user',
        createdAt: '2024-06-01T00:00:00.000Z',
      };
      storage.getUsers.mockReturnValue([mockUser]);

      const result = login('testuser', 'testpass');
      expect(result.success).toBe(true);
      expect(result.session).toEqual({
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
      expect(storage.setSession).toHaveBeenCalledWith({
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
    });

    it('rejects localStorage user login with wrong password', () => {
      const mockUser = {
        id: 'u1',
        displayName: 'Test User',
        username: 'testuser',
        password: 'testpass',
        role: 'user',
        createdAt: '2024-06-01T00:00:00.000Z',
      };
      storage.getUsers.mockReturnValue([mockUser]);

      const result = login('testuser', 'wrongpass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password.');
      expect(storage.setSession).not.toHaveBeenCalled();
    });

    it('rejects login with non-existent username', () => {
      storage.getUsers.mockReturnValue([]);

      const result = login('nonexistent', 'somepass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password.');
      expect(storage.setSession).not.toHaveBeenCalled();
    });

    it('checks hard-coded admin before localStorage users', () => {
      const mockUser = {
        id: 'u1',
        displayName: 'Fake Admin',
        username: 'admin',
        password: 'adminpass',
        role: 'user',
        createdAt: '2024-06-01T00:00:00.000Z',
      };
      storage.getUsers.mockReturnValue([mockUser]);

      const result = login('admin', 'adminpass');
      expect(result.success).toBe(true);
      expect(result.session.role).toBe('admin');
      expect(result.session.userId).toBe('admin');
    });
  });

  // --- register ---

  describe('register', () => {
    it('registers a new user successfully', () => {
      storage.getUsers.mockReturnValue([]);

      const result = register('New User', 'newuser', 'newpass');
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.username).toBe('newuser');
      expect(result.session.displayName).toBe('New User');
      expect(result.session.role).toBe('user');
      expect(result.session.userId).toBeDefined();
      expect(storage.addUser).toHaveBeenCalledTimes(1);
      expect(storage.setSession).toHaveBeenCalledTimes(1);

      const addedUser = storage.addUser.mock.calls[0][0];
      expect(addedUser.displayName).toBe('New User');
      expect(addedUser.username).toBe('newuser');
      expect(addedUser.password).toBe('newpass');
      expect(addedUser.role).toBe('user');
      expect(addedUser.id).toBeDefined();
      expect(addedUser.createdAt).toBeDefined();
    });

    it('returns error when displayName is empty', () => {
      const result = register('', 'newuser', 'newpass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required.');
      expect(storage.addUser).not.toHaveBeenCalled();
      expect(storage.setSession).not.toHaveBeenCalled();
    });

    it('returns error when username is empty', () => {
      const result = register('New User', '', 'newpass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required.');
    });

    it('returns error when password is empty', () => {
      const result = register('New User', 'newuser', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required.');
    });

    it('rejects registration with admin username', () => {
      const result = register('Sneaky Admin', 'admin', 'somepass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username already exists.');
      expect(storage.addUser).not.toHaveBeenCalled();
      expect(storage.setSession).not.toHaveBeenCalled();
    });

    it('rejects registration with duplicate username', () => {
      const existingUser = {
        id: 'u1',
        displayName: 'Existing User',
        username: 'taken',
        password: 'pass',
        role: 'user',
        createdAt: '2024-06-01T00:00:00.000Z',
      };
      storage.getUsers.mockReturnValue([existingUser]);

      const result = register('Another User', 'taken', 'newpass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username already exists.');
      expect(storage.addUser).not.toHaveBeenCalled();
      expect(storage.setSession).not.toHaveBeenCalled();
    });

    it('sets session after successful registration', () => {
      storage.getUsers.mockReturnValue([]);

      const result = register('Session User', 'sessionuser', 'pass123');
      expect(result.success).toBe(true);
      expect(storage.setSession).toHaveBeenCalledTimes(1);

      const sessionArg = storage.setSession.mock.calls[0][0];
      expect(sessionArg.username).toBe('sessionuser');
      expect(sessionArg.displayName).toBe('Session User');
      expect(sessionArg.role).toBe('user');
      expect(sessionArg.userId).toBeDefined();
    });
  });

  // --- logout ---

  describe('logout', () => {
    it('clears the session', () => {
      logout();
      expect(storage.clearSession).toHaveBeenCalledTimes(1);
    });
  });

  // --- getSession ---

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      storage.getSession.mockReturnValue(null);
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns the session object when a session exists', () => {
      const mockSession = {
        userId: 'u1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      storage.getSession.mockReturnValue(mockSession);

      const session = getSession();
      expect(session).toEqual(mockSession);
    });

    it('returns admin session when admin is logged in', () => {
      const adminSession = {
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      storage.getSession.mockReturnValue(adminSession);

      const session = getSession();
      expect(session).toEqual(adminSession);
      expect(session.role).toBe('admin');
    });
  });
});