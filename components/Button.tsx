import React from 'react';

// Defines the props interface for the Button component.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; // Content to be rendered inside the button.
  variant?: 'primary' | 'secondary' | 'danger'; // Predefined style variants.
  fullWidth?: boolean; // If true, button takes full width of its container.
}

/**
 * A reusable Button component with Tailwind CSS for consistent styling.
 * Supports different variants and can span full width.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '', // Allow additional custom classes
  ...rest
}) => {
  // Base styles applied to all buttons
  let baseStyles = 'py-2 px-4 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Apply variant-specific styles
  if (variant === 'primary') {
    baseStyles += ' bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
  } else if (variant === 'secondary') {
    baseStyles += ' bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-500';
  } else if (variant === 'danger') {
    baseStyles += ' bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
  }

  // Apply fullWidth style if prop is true
  if (fullWidth) {
    baseStyles += ' w-full';
  }

  // Combine base styles with any custom classes passed in.
  const combinedClassName = `${baseStyles} ${className}`.trim();

  return (
    <button className={combinedClassName} {...rest}>
      {children}
    </button>
  );
};

export default Button;
