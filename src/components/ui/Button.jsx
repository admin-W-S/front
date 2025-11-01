const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled = false, onClick, ...props }) => {
  const baseClasses = 'font-semibold rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-600 hover-gentle disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100',
    secondary: 'bg-gray-100 text-text hover:bg-gray-200 hover-gentle',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white hover-gentle',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover-gentle',
    ghost: 'text-textSecondary hover:bg-blue-50 hover-gentle shadow-none',
    yellow: 'bg-secondary text-black hover:bg-yellow-400 hover-gentle',
  };
  
  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

