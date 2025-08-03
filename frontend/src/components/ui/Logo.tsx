import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full brand-gradient flex items-center justify-center shadow-lg`}>
        <div className="w-3/5 h-3/5 bg-white rounded-full flex items-center justify-center">
          <div className="w-2/3 h-2/3 brand-gradient rounded-full"></div>
        </div>
      </div>
      <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
        ProductivityApp
      </span>
    </div>
  );
};