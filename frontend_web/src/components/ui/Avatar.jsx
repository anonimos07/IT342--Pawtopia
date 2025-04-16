import React from 'react';

export default function Avatar({ src, alt = 'User', fallback = 'U', size = 'w-9 h-9', className = '', ...props }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium overflow-hidden ${size} ${className}`}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = ''; // Fallback to initials if image fails
          }}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
