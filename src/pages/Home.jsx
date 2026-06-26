import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BlogCard from '../components/BlogCard.jsx';
import { getPosts, getUsers } from '../utils/storage.js';

/**
 * Get all posts from localStorage, sorted by createdAt descending (newest first).
 * @returns {Array<Object>} Array of post objects sorted by date.
 */
function getSortedPosts() {
  const posts = getPosts();
  return posts
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Build a map of user ids to their roles.
 * Includes the hard-coded admin user.
 * @returns {Object} Map of userId -> role.
 */
function getUserRoleMap() {
  const users = getUsers();
  const roleMap = { admin: 'admin' };
  users.forEach((u) => {
    roleMap[u.id] = u.role;
  });
  return roleMap;
}

/**
 * Authenticated blog list page component.
 * Displays all posts from localStorage in a responsive grid, sorted newest first.
 * Each post is rendered as a BlogCard with ownership-aware edit icon.
 * Shows an empty state with CTA to write the first post if no posts exist.
 * @returns {JSX.Element}
 */
export default function Home() {
  const posts = getSortedPosts();
  const roleMap = getUserRoleMap();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">All Posts</h1>
          <Link
            to="/write"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
          >
            Write a Post
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                authorRole={roleMap[post.authorId] || 'user'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-6">
              No posts yet. Be the first to share your thoughts!
            </p>
            <Link
              to="/write"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
            >
              Write Your First Post
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}