const Input = ({ className = '', label, error, icon, as, children, ...props }) => {
  const baseInputClasses = `
    w-full px-4 py-2.5 border rounded-lg transition-all duration-200
    focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none
    ${icon ? 'pl-10' : ''}
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        {as === 'select' ? (
          <select className={baseInputClasses} {...props}>
            {children}
          </select>
        ) : (
          <input
            className={baseInputClasses}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
