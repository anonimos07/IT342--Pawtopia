import React from 'react';

export function Breadcrumb({ children, className = "", ...props }) {
  return (
    <nav className={`flex ${className}`} aria-label="breadcrumb" {...props}>
      {children}
    </nav>
  );
}

export function BreadcrumbList({ children, className = "", ...props }) {
  return (
    <ol className={`flex flex-wrap items-center gap-1.5 ${className}`} {...props}>
      {children}
    </ol>
  );
}

export function BreadcrumbItem({ children, className = "", ...props }) {
  return (
    <li className={`inline-flex items-center gap-1.5 ${className}`} {...props}>
      {children}
    </li>
  );
}

export function BreadcrumbLink({ children, href, className = "", ...props }) {
  return href ? (
    <a 
      href={href} 
      className={`text-sm font-medium underline-offset-4 hover:underline ${className}`}
      {...props}
    >
      {children}
    </a>
  ) : (
    <span 
      className={`text-sm font-medium ${className}`} 
      aria-current="page"
      {...props}
    >
      {children}
    </span>
  );
}

export function BreadcrumbSeparator({ children, className = "", ...props }) {
  return (
    <li className={`text-sm text-muted-foreground ${className}`} {...props}>
      {children || <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="m9 18 6-6-6-6"/>
      </svg>}
    </li>
  );
}