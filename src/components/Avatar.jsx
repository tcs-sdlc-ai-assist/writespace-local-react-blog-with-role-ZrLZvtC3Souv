import React from 'react';
import PropTypes from 'prop-types';

/**
 * Returns a JSX element representing a role-distinct avatar.
 * @param {'admin' | 'user'} role - The role to render an avatar for.
 * @returns {JSX.Element} A styled avatar element.
 */
export function getAvatar(role) {
  if (role === 'admin') {
    return (
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-200 text-base"
        title="Admin"
      >
        👑
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-200 text-base"
      title="User"
    >
      📖
    </span>
  );
}

/**
 * Avatar component that renders a role-distinct avatar.
 * @param {Object} props
 * @param {'admin' | 'user'} props.role - The role to render an avatar for.
 * @returns {JSX.Element}
 */
export default function Avatar({ role }) {
  return getAvatar(role);
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
};