import { getUsers, addUser, getSession as storageGetSession, setSession, clearSession } from './storage.js';

/**
 * Hard-coded admin credentials.
 */
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'adminpass';

/**
 * Generate a simple unique id.
 * @returns {string} A unique id string.
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Attempt to log in with the given credentials.
 * Checks hard-coded admin credentials first, then localStorage users.
 * @param {string} username - The username to log in with.
 * @param {string} password - The password to log in with.
 * @returns {{ success: boolean, session?: Object, error?: string }}
 */
export function login(username, password) {
  if (!username || !password) {
    return { success: false, error: 'All fields are required.' };
  }

  // Check hard-coded admin
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const session = {
      userId: 'admin',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
    };
    setSession(session);
    return { success: true, session };
  }

  // Check localStorage users
  const users = getUsers();
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    const session = {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    };
    setSession(session);
    return { success: true, session };
  }

  return { success: false, error: 'Invalid username or password.' };
}

/**
 * Register a new user account.
 * Validates all fields, checks username uniqueness, creates user and session.
 * @param {string} displayName - The display name for the new user.
 * @param {string} username - The desired username.
 * @param {string} password - The desired password.
 * @returns {{ success: boolean, session?: Object, error?: string }}
 */
export function register(displayName, username, password) {
  if (!displayName || !username || !password) {
    return { success: false, error: 'All fields are required.' };
  }

  // Check against hard-coded admin username
  if (username === ADMIN_USERNAME) {
    return { success: false, error: 'Username already exists.' };
  }

  // Check uniqueness among existing users
  const users = getUsers();
  if (users.some((u) => u.username === username)) {
    return { success: false, error: 'Username already exists.' };
  }

  const user = {
    id: generateId(),
    displayName,
    username,
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  addUser(user);

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };

  setSession(session);

  return { success: true, session };
}

/**
 * Log out the current user by clearing the session.
 */
export function logout() {
  clearSession();
}

/**
 * Get the current session from localStorage.
 * @returns {Object|null} The session object, or null if not logged in.
 */
export function getSession() {
  return storageGetSession();
}