import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
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
 * Admin overview dashboard page component.
 * Displays gradient banner header, four stat cards (total posts, total users,
 * admin posts, user posts), quick-action buttons, and recent posts section.
 * @returns {JSX.Element}
 */
export default function AdminDashboard() {
  const posts = getSortedPosts();
  const users = getUsers();
  const roleMap = getUserRoleMap();

  const totalPosts = posts.length;
  // +1 for the hard-coded admin user
  const totalUsers = users.length + 1;
  const adminPosts = posts.filter((p) => p.authorId === 'admin').length;
  const userPosts = totalPosts - adminPosts;
  const recentPosts = posts.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Gradient Banner Header */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Admin Dashboard
          </h1>
          <p className="text-indigo-100 text-lg">
            Overview of your WriteSpace platform.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Posts"
            value={totalPosts}
            icon="📝"
            bgColor="bg-white"
          />
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon="👥"
            bgColor="bg-white"
          />
          <StatCard
            title="Admin Posts"
            value={adminPosts}
            icon="👑"
            bgColor="bg-white"
          />
          <StatCard
            title="User Posts"
            value={userPosts}
            icon="📖"
            bgColor="bg-white"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/write"
            className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
          >
            Write a Post
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Manage Users
          </Link>
        </div>

        {/* Recent Posts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
          {recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
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
                No posts yet. Create the first post!
              </p>
              <Link
                to="/write"
                className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
              >
                Write Your First Post
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}