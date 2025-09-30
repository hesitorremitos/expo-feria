import React from 'react';

const Button = (props) => {
  const { 
    children, 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    href,
    onClick,
    disabled = false,
    type = 'button',
    ...restProps 
  } = props;
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-700 hover:bg-primary-800 text-white shadow-lg shadow-primary-700/30 focus:ring-primary-500',
    secondary: 'bg-secondary-400 hover:bg-secondary-500 text-primary-900 shadow-lg shadow-secondary-400/30 focus:ring-secondary-400',
    outline: 'bg-white border-2 border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white focus:ring-primary-500',
    ghost: 'bg-transparent text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
    filter: 'bg-white text-accent-700 border border-accent-300 hover:bg-accent-50 shadow-sm focus:ring-accent-500',
    'filter-active': 'bg-primary-700 text-white shadow-lg shadow-primary-700/30 focus:ring-primary-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 focus:ring-green-500'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl',
    xl: 'px-10 py-5 text-xl rounded-2xl'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  // Si tiene href, renderizar como enlace
  if (href) {
    return (
      <a href={href} className={classes} {...restProps}>
        {children}
      </a>
    );
  }

  // Renderizar como botón
  return (
    <button 
      type={type}
      className={classes} 
      onClick={onClick}
      disabled={disabled}
      {...restProps}
    >
      {children}
    </button>
  );
};

export default Button;
