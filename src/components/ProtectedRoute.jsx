import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/auth.js';

/**
 * Route guard component that enforces authentication and role-based access.
 * @param {Object} props
 * @param {'admin' | 'user'} [props.role] - Optional role requirement. If 'admin', non-admin users are redirected to /blogs.
 * @param {React.ReactNode} props.children - The child elements to render if access is granted.
 * @returns {JSX.Element} The children if authorized, or a Navigate redirect.
 */
export default function ProtectedRoute({ role, children }) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin' && session.role !== 'admin') {
    return <Navigate to="/blogs" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']),
  children: PropTypes.node.isRequired,
};