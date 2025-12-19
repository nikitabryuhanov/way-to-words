import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

const Card = ({ children, className = '', hover = false }: CardProps) => {
  const baseStyles =
    'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700';
  const hoverStyles = hover
    ? 'hover:shadow-lg transition-shadow duration-200'
    : '';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export default Card;

