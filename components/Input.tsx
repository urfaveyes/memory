import React from 'react';

// Defines the props interface for the Input component.
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Optional label for the input field.
  id: string; // Unique ID for the input, essential for accessibility (label-for).
  error?: string; // Optional error message to display below the input.
}

/**
 * A reusable Input component with Tailwind CSS for consistent styling and accessibility.
 * Includes optional label and error message display.
 */
const Input: React.FC<InputProps> = ({
  label,
  id,
  error,
  className = '', // Allow additional custom classes
  ...rest
}) => {
  // Base styles for the input field.
  const baseInputStyles = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`${baseInputStyles} ${className}`.trim()}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
