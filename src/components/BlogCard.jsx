import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getAvatar } from './Avatar.jsx';
import { getSession } from '../utils/auth.js';

/**
 * Truncate content to a given max length, appending ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum character length.
 * @returns {string} The truncated text.
 */
function truncate(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

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
 * Determine whether the current session user can edit or delete a post.
 * @param {Object} post - The post object.
 * @param {Object|null} session - The current session object.
 * @returns {boolean} True if the user can edit/delete the post.
 */
function canEdit(post, session) {
  if (!session) return false;
  if (session.role === 'admin') return true;
  return post.authorId === session.userId;
}

/**
 * Reusable blog post card component.
 * Displays post title, excerpt, date, author name with avatar,
 * and an edit icon based on ownership rules.
 * @param {Object} props
 * @param {Object} props.post - The post object to display.
 * @param {string} props.post.id - The post id.
 * @param {string} props.post.title - The post title.
 * @param {string} props.post.content - The post content.
 * @param {string} props.post.createdAt - The post creation date (ISO string).
 * @param {string} props.post.authorId - The post author's user id.
 * @param {string} props.post.authorName - The post author's display name.
 * @param {string} [props.authorRole] - The role of the post author ('admin' or 'user'). Defaults to 'user'.
 * @returns {JSX.Element}
 */
export default function BlogCard({ post, authorRole }) {
  const session = getSession();
  const role = authorRole || (post.authorId === 'admin' ? 'admin' : 'user');
  const showEdit = canEdit(post, session);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow">
      <Link to={`/blog/${post.id}`} className="group">
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {post.title}
        </h2>
      </Link>

      <p className="text-gray-600 text-sm leading-relaxed">
        {truncate(post.content)}
      </p>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {getAvatar(role)}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">
              {post.authorName}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>

        {showEdit && (
          <Link
            to={`/edit/${post.id}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit post"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    authorId: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
  }).isRequired,
  authorRole: PropTypes.oneOf(['admin', 'user']),
};