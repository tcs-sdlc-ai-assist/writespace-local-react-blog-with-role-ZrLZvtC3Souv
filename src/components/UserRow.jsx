import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getAvatar } from './Avatar.jsx';
import { getSession } from '../utils/auth.js';

/**
 * Format an ISO date string to a human-readable format.
 * @param {string} isoString - The ISO date string.
 * @returns {string} Formatted date string.
 */
function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * User table row/card component for admin user management.
 * Displays user info (avatar, display name, username, role, created date)
 * and delete button. Prevents deletion of hard-coded admin and self-deletion.
 * Uses confirmation dialog before delete.
 * @param {Object} props
 * @param {Object} props.user - The user object to display.
 * @param {string} props.user.id - The user id.
 * @param {string} props.user.displayName - The user's display name.
 * @param {string} props.user.username - The user's username.
 * @param {string} props.user.role - The user's role ('admin' or 'user').
 * @param {string} props.user.createdAt - The user's creation date (ISO string).
 * @param {Function} props.onDelete - Callback invoked with user id when delete is confirmed.
 * @returns {JSX.Element}
 */
export default function UserRow({ user, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const session = getSession();

  const isHardCodedAdmin = user.id === 'admin';
  const isSelf = session && session.userId === user.id;
  const canDelete = !isHardCodedAdmin && !isSelf;

  /**
   * Handle delete button click — show confirmation.
   */
  function handleDeleteClick() {
    setConfirming(true);
  }

  /**
   * Handle confirm delete — invoke onDelete callback.
   */
  function handleConfirmDelete() {
    setConfirming(false);
    onDelete(user.id);
  }

  /**
   * Handle cancel delete — hide confirmation.
   */
  function handleCancelDelete() {
    setConfirming(false);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
      <div className="flex-shrink-0">
        {getAvatar(user.role)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900 truncate">
            {user.displayName}
          </span>
          <span className="text-xs font-medium text-gray-500">
            @{user.username}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span
            className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
              user.role === 'admin'
                ? 'bg-violet-100 text-violet-700'
                : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            {user.role}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(user.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0">
        {confirming ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={handleCancelDelete}
              className="text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          canDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete user"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )
        )}
      </div>
    </div>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};