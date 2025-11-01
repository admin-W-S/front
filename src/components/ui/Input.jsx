const Input = ({ label, type = 'text', error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-base font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 transition-soft ${
          error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-primary focus:border-primary'
        } ${className}`}
        placeholder={props.placeholder ? props.placeholder : undefined}
        {...props}
      />
      {error && <p className="mt-2 text-base text-red-600 font-medium">{error}</p>}
    </div>
  );
};

export default Input;

