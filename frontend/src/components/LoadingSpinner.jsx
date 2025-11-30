const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 border-4 border-golf-green-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-golf-green-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      {message && (
        <p className="text-gray-600 text-sm font-medium">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
