import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession, logout } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

/**
 * Authenticated navigation bar component.
 * Displays WriteSpace logo, navigation links, role-aware admin links,
 * user avatar with display name, and logout button.
 * @returns {JSX.Element}
 */
export default function Navbar() {
  const session = getSession();
  const navigate = useNavigate();

  /**
   * Handle logout — clear session and redirect to login page.
   */
  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!session) {
    return null;
  }

  const isAdmin = session.role === 'admin';

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-indigo-600">WriteSpace</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                to="/blogs"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Blogs
              </Link>
              <Link
                to="/write"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Write
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Users
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getAvatar(session.role)}
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                {session.displayName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}