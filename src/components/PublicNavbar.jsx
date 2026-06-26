import React from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

/**
 * Public navigation bar component.
 * Displays WriteSpace logo, and role-aware CTAs:
 * - Guests see Login and Get Started buttons.
 * - Authenticated users see their avatar and a dashboard CTA.
 * @returns {JSX.Element}
 */
export default function PublicNavbar() {
  const session = getSession();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">WriteSpace</span>
          </Link>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  to={session.role === 'admin' ? '/admin' : '/blogs'}
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  {getAvatar(session.role)}
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {session.displayName}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}