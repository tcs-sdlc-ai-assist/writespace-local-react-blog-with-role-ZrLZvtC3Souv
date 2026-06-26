import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getAvatar } from '../components/Avatar.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts, getUsers, removePost } from '../utils/storage.js';

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
 * Determine the role of a post's author.
 * @param {string} authorId - The author's user id.
 * @returns {'admin' | 'user'} The author's role.
 */
function getAuthorRole(authorId) {
  if (authorId === 'admin') return 'admin';
  const users = getUsers();
  const user = users.find((u) => u.id === authorId);
  return user ? user.role : 'user';
}

/**
 * Determine whether the current session user can edit or delete a post.
 * @param {Object} post - The post object.
 * @param {Object|null} session - The current session object.
 * @returns {boolean} True if the user can edit/delete the post.
 */
function canModify(post, session) {
  if (!session) return false;
  if (session.role === 'admin') return true;
  return post.authorId === session.userId;
}

/**
 * Single blog post full reading view page component.
 * Displays title, author name with avatar, creation date, and full content.
 * Edit and delete buttons shown per role/ownership rules.
 * Handles invalid/missing post IDs with error message and back link.
 * @returns {JSX.Element}
 */
export default function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();

  const posts = getPosts();
  const post = posts.find((p) => p.id === id);

  /**
   * Handle delete button click — confirm and remove post.
   */
  function handleDelete() {
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (confirmed) {
      removePost(post.id);
      navigate('/blogs', { replace: true });
    }
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-6">
              Post not found. It may have been deleted or the URL is incorrect.
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
            >
              Back to Blogs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const role = getAuthorRole(post.authorId);
  const showActions = canModify(post, session);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link
          to="/blogs"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-6 transition-colors"
        >
          ← Back to Blogs
        </Link>

        <article className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
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

            {showActions && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/edit/${post.id}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </article>
      </main>
    </div>
  );
}