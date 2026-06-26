import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, getSession } from '../utils/auth.js';

/**
 * Login page component.
 * Centered card UI with gradient background.
 * Authenticates via auth.js login(). On success, redirects admin to /admin and user to /blogs.
 * Shows inline error on failure. Redirects authenticated users to their home.
 * @returns {JSX.Element}
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/blogs', { replace: true });
      }
    }
  }, [navigate]);

  /**
   * Handle form submission — attempt login and redirect on success.
   * @param {React.FormEvent} e - The form submit event.
   */
  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const result = login(username, password);

    if (result.success) {
      if (result.session.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/blogs', { replace: true });
      }
    } else {
      setError(result.error || 'Login failed.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold text-indigo-600">WriteSpace</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-4">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}