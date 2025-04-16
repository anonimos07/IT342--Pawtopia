import React, { useState, createContext, useContext } from 'react';

const RadioGroupContext = createContext(null);

export function RadioGroup({ defaultValue, value, onValueChange, children, ...props }) {
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');

  const handleChange = (newValue) => {
    if (value === undefined) {
      setSelectedValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <RadioGroupContext.Provider value={{ value: value || selectedValue, onChange: handleChange }}>
      <div role="radiogroup" className="space-y-2" {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({ value, id, ...props }) {
  const context = useContext(RadioGroupContext);
  
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }
  
  const { value: selectedValue, onChange } = context;
  const checked = selectedValue === value;

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
      {...props}
    />
  );
}