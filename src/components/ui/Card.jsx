const Card = ({ children, className = '', hover = false, onClick }) => {
  const baseClasses = 'bg-white rounded-2xl p-6 border border-gray-100 shadow-sm';
  const hoverClasses = hover ? 'cursor-pointer hover-gentle hover:shadow-lg' : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;

