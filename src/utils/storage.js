const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';
const SESSION_KEY = 'writespace_session';

/**
 * Safely parse JSON from localStorage.
 * @param {string} key - The localStorage key to read.
 * @param {*} fallback - The fallback value if parsing fails.
 * @returns {*} The parsed value or the fallback.
 */
function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Safely write JSON to localStorage.
 * @param {string} key - The localStorage key to write.
 * @param {*} value - The value to serialize and store.
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable or quota exceeded; silently fail
  }
}

/**
 * Safely remove a key from localStorage.
 * @param {string} key - The localStorage key to remove.
 */
function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // localStorage unavailable; silently fail
  }
}

// --- Posts ---

/**
 * Get all posts from localStorage.
 * @returns {Array<Object>} Array of post objects.
 */
export function getPosts() {
  return safeGet(POSTS_KEY, []);
}

/**
 * Add a new post to localStorage.
 * @param {Object} post - The post object to add.
 */
export function addPost(post) {
  const posts = getPosts();
  posts.push(post);
  safeSet(POSTS_KEY, posts);
}

/**
 * Update an existing post by id.
 * @param {string} id - The id of the post to update.
 * @param {Object} updates - Partial post object with fields to update.
 */
export function updatePost(id, updates) {
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...updates };
    safeSet(POSTS_KEY, posts);
  }
}

/**
 * Remove a post by id.
 * @param {string} id - The id of the post to remove.
 */
export function removePost(id) {
  const posts = getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  safeSet(POSTS_KEY, filtered);
}

// --- Users ---

/**
 * Get all users from localStorage.
 * @returns {Array<Object>} Array of user objects.
 */
export function getUsers() {
  return safeGet(USERS_KEY, []);
}

/**
 * Add a new user to localStorage.
 * @param {Object} user - The user object to add.
 */
export function addUser(user) {
  const users = getUsers();
  users.push(user);
  safeSet(USERS_KEY, users);
}

/**
 * Update an existing user by id.
 * @param {string} id - The id of the user to update.
 * @param {Object} updates - Partial user object with fields to update.
 */
export function updateUser(id, updates) {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    safeSet(USERS_KEY, users);
  }
}

/**
 * Remove a user by id.
 * @param {string} id - The id of the user to remove.
 */
export function removeUser(id) {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  safeSet(USERS_KEY, filtered);
}

// --- Session ---

/**
 * Get the current session from localStorage.
 * @returns {Object|null} The session object, or null if not set.
 */
export function getSession() {
  return safeGet(SESSION_KEY, null);
}

/**
 * Set the current session in localStorage.
 * @param {Object} session - The session object to store.
 */
export function setSession(session) {
  safeSet(SESSION_KEY, session);
}

/**
 * Clear the current session from localStorage.
 */
export function clearSession() {
  safeRemove(SESSION_KEY);
}