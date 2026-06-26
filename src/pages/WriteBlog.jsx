import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts, addPost, updatePost } from '../utils/storage.js';

/**
 * Generate a simple unique id.
 * @returns {string} A unique id string.
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Blog post create and edit form page component.
 * Create mode at `/write` available to all authenticated users.
 * Edit mode at `/edit/:id` enforces ownership (users edit own posts, admin edits any).
 * Form with title and content fields, character counter for content,
 * validation for required fields, save and cancel buttons.
 * On save, persists to localStorage via storage.js.
 * @returns {JSX.Element}
 */
export default function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();

  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }

    if (isEditMode) {
      const posts = getPosts();
      const post = posts.find((p) => p.id === id);

      if (!post) {
        navigate('/blogs', { replace: true });
        return;
      }

      // Enforce ownership: users can only edit their own posts, admin can edit any
      if (session.role !== 'admin' && post.authorId !== session.userId) {
        navigate('/blogs', { replace: true });
        return;
      }

      setTitle(post.title);
      setContent(post.content);
    }
  }, [id, isEditMode, navigate, session]);

  /**
   * Handle form submission — validate fields and save post.
   * @param {React.FormEvent} e - The form submit event.
   */
  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError('Title and content are required.');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        updatePost(id, {
          title: trimmedTitle,
          content: trimmedContent,
          updatedAt: new Date().toISOString(),
        });
        navigate(`/blog/${id}`, { replace: true });
      } else {
        const newPost = {
          id: generateId(),
          title: trimmedTitle,
          content: trimmedContent,
          authorId: session.userId,
          authorName: session.displayName,
          createdAt: new Date().toISOString(),
        };
        addPost(newPost);
        navigate('/blogs', { replace: true });
      }
    } catch {
      setError('Failed to save post. Please try again.');
      setLoading(false);
    }
  }

  /**
   * Handle cancel button click — navigate back.
   */
  function handleCancel() {
    if (isEditMode) {
      navigate(`/blog/${id}`);
    } else {
      navigate('/blogs');
    }
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          {isEditMode ? 'Edit Post' : 'Write a New Post'}
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter your post title"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="text-sm font-medium text-gray-700">
                Content
              </label>
              <span className="text-xs text-gray-500">
                {content.length} characters
              </span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y"
              placeholder="Write your post content here..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Post' : 'Publish Post'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}