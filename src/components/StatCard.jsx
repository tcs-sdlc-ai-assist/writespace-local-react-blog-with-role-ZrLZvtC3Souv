import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable stat card component for admin dashboard.
 * Displays a title, value, and optional icon with styled background.
 * @param {Object} props
 * @param {string} props.title - The label/title for the statistic.
 * @param {number|string} props.value - The statistic value to display.
 * @param {React.ReactNode} [props.icon] - Optional icon or emoji to display.
 * @param {string} [props.bgColor] - Optional Tailwind background color class. Defaults to 'bg-white'.
 * @returns {JSX.Element}
 */
export default function StatCard({ title, value, icon, bgColor }) {
  const bg = bgColor || 'bg-white';

  return (
    <div className={`${bg} rounded-lg shadow-md p-6 flex items-center gap-4`}>
      {icon && (
        <div className="flex-shrink-0 text-3xl">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.node,
  bgColor: PropTypes.string,
};