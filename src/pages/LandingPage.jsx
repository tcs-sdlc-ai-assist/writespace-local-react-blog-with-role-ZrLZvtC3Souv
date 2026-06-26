import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import BlogCard from '../components/BlogCard.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts } from '../utils/storage.js';

/**
 * Get the latest posts from localStorage, sorted by createdAt descending.
 * @param {number} count - Maximum number of posts to return.
 * @returns {Array<Object>} Array of post objects.
 */
function getLatestPosts(count = 3) {
  const posts = getPosts();
  return posts
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, count);
}

/**
 * Feature card data for the features section.
 */
const features = [
  {
    icon: '✍️',
    title: 'Write & Publish',
    description: 'Create beautiful blog posts with our simple editor. Share your thoughts with the world in seconds.',
  },
  {
    icon: '🔒',
    title: 'Role-Based Access',
    description: 'Admins manage everything. Users own their content. Secure, simple, and transparent.',
  },
  {
    icon: '⚡',
    title: 'Instant & Local',
    description: 'No server needed. All data stays in your browser with lightning-fast performance.',
  },
];

/**
 * Public landing page component.
 * Displays hero section, features, latest posts preview, and footer.
 * @returns {JSX.Element}
 */
export default function LandingPage() {
  const session = getSession();
  const latestPosts = getLatestPosts(3);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Welcome to <span className="text-yellow-300">WriteSpace</span>
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            A simple, beautiful platform to write, share, and manage blog posts.
            No servers, no complexity — just you and your words.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {session ? (
              <Link
                to={session.role === 'admin' ? '/admin' : '/blogs'}
                className="inline-flex items-center px-8 py-3 text-base font-semibold rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 text-base font-semibold rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-3 text-base font-semibold rounded-lg border-2 border-white text-white hover:bg-white hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Decorative animated element */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div
            className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-5 rounded-full"
            style={{
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white opacity-5 rounded-full"
            style={{
              animation: 'pulse 5s ease-in-out infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.05; }
            50% { transform: scale(1.1); opacity: 0.1; }
          }
        `}</style>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why WriteSpace?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Everything you need to start blogging, right in your browser.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Latest Posts
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Check out what people are writing about.
            </p>
          </div>
          {latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                No posts yet. Be the first to write something!
              </p>
              {!session && (
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">WriteSpace</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/blogs"
                className="text-sm hover:text-white transition-colors"
              >
                Blogs
              </Link>
              <Link
                to="/login"
                className="text-sm hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm hover:text-white transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}