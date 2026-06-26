import React, { useState, useCallback } from 'react';
import Navbar from '../components/Navbar.jsx';
import UserRow from '../components/UserRow.jsx';
import { getUsers, addUser, removeUser, removePost, getPosts } from '../utils/storage.js';

/**
 * Generate a simple unique id.
 * @returns {string} A unique id string.
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Hard-coded admin user object for display purposes.
 * @returns {Object} The admin user object.
 */
function getAdminUser() {
  return {
    id: 'admin',
    displayName: 'Admin',
    username: 'admin',
    role: 'admin',
    createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
  };
}

/**
 * Admin user management page component.
 * Displays all users (including hard-coded admin) using UserRow components.
 * Provides a create user form with validation.
 * Supports user deletion with confirmation (via UserRow).
 * Hard-coded admin cannot be deleted. Self-deletion is prevented.
 * @returns {JSX.Element}
 */
export default function UserManagement() {
  const [users, setUsers] = useState(() => getUsers());
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Refresh users list from localStorage.
   */
  const refreshUsers = useCallback(() => {
    setUsers(getUsers());
  }, []);

  /**
   * Handle create user form submission.
   * Validates fields, checks username uniqueness, creates user.
   * @param {React.FormEvent} e - The form submit event.
   */
  function handleCreateUser(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedDisplayName || !trimmedUsername || !trimmedPassword) {
      setError('All fields are required.');
      return;
    }

    // Check against hard-coded admin username
    if (trimmedUsername === 'admin') {
      setError('Username already exists.');
      return;
    }

    // Check uniqueness among existing users
    const existingUsers = getUsers();
    if (existingUsers.some((u) => u.username === trimmedUsername)) {
      setError('Username already exists.');
      return;
    }

    const newUser = {
      id: generateId(),
      displayName: trimmedDisplayName,
      username: trimmedUsername,
      password: trimmedPassword,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    addUser(newUser);
    refreshUsers();

    setDisplayName('');
    setUsername('');
    setPassword('');
    setSuccess(`User "${trimmedDisplayName}" created successfully.`);
  }

  /**
   * Handle user deletion — remove user and their posts from localStorage.
   * @param {string} userId - The id of the user to delete.
   */
  function handleDeleteUser(userId) {
    // Remove all posts by this user
    const posts = getPosts();
    const userPosts = posts.filter((p) => p.authorId === userId);
    userPosts.forEach((p) => {
      removePost(p.id);
    });

    removeUser(userId);
    refreshUsers();
    setSuccess('User deleted successfully.');
    setError('');
  }

  // Build full user list: hard-coded admin + localStorage users
  const allUsers = [getAdminUser(), ...users];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Gradient Banner Header */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            User Management
          </h1>
          <p className="text-indigo-100 text-lg">
            Manage all WriteSpace user accounts.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Create User Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New User</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-600 text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter display name"
                  autoComplete="name"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
              >
                Create User
              </button>
            </div>
          </form>
        </div>

        {/* Users List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              All Users ({allUsers.length})
            </h2>
          </div>

          {allUsers.length > 0 ? (
            <div className="flex flex-col gap-4">
              {allUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No users found.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}