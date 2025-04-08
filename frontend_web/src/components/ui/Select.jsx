import React, { useState, useRef, useEffect } from 'react';

export function Select({ children, defaultValue, value, onChange, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
  const selectRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (value) => {
    setSelectedValue(value);
    setIsOpen(false);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div ref={selectRef} className="relative" {...props}>
      <SelectTrigger 
        onClick={() => setIsOpen(!isOpen)} 
        className={props.className}
      >
        <SelectValue placeholder={props.placeholder}>
          {React.Children.toArray(children)
            .filter(child => React.isValidElement(child) && child.props.value === selectedValue)
            .map(child => child.props.children)}
        </SelectValue>
      </SelectTrigger>
      
      {isOpen && (
        <SelectContent>
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                onSelect: () => handleSelect(child.props.value)
              });
            }
            return child;
          })}
        </SelectContent>
      )}
    </div>
  );
}

export function SelectTrigger({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>
  );
}

export function SelectValue({ children, placeholder }) {
  return (
    <span className="flex-1 text-left truncate">
      {children || placeholder}
    </span>
  );
}

export function SelectContent({ children }) {
  return (
    <div className="absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1">
      <div className="p-1">{children}</div>
    </div>
  );
}

export function SelectItem({ children, value, onSelect, ...props }) {
  return (
    <div
      role="option"
      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      onClick={onSelect}
      {...props}
    >
      <span className="flex-1">{children}</span>
    </div>
  );
}