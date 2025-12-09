import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className, title, ...props }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className || ''}`} {...props}>
      {title && <h2 className="text-xl font-bold p-4 bg-gray-50 border-b">{title}</h2>}
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;