import React from 'react';
import './QuadrantPopup.css';

interface QuadrantPopupProps {
  position: 'upper-left' | 'upper-right' | 'lower-right' | 'lower-left';
  isVisible: boolean;
  title: string;
  content: string;
  className?: string;
}

const QuadrantPopup: React.FC<QuadrantPopupProps> = ({
  position,
  isVisible,
  title,
  content,
  className = ''
}) => {
  return (
    <div 
      className={`quadrant-popup ${position} ${isVisible ? 'visible' : ''} ${className}`}
    >
      <div className="quadrant-content">
        <h3>{title}</h3>
        <p>{content}</p>
      </div>
    </div>
  );
};

export default QuadrantPopup;