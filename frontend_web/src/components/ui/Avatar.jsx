import React from 'react';

function AvatarRoot({ children, className = '', size = 'w-9 h-9', ...props }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium overflow-hidden ${size} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function AvatarImage({ src, alt, className = '', ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = ''; // Fallback to initials if image fails
      }}
      {...props}
    />
  );
}

function AvatarFallback({ children, className = '' }) {
  return <span className={className}>{children}</span>;
}

const Avatar = Object.assign(AvatarRoot, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
});

export default Avatar;