import React from 'react';
import { Chip } from '@mui/material';

interface ScrollPillProps {
  opacity: number;
  className?: string;
}

const ScrollPill: React.FC<ScrollPillProps> = ({ opacity, className = '' }) => {
  return (
    <Chip
      label="Scroll Down"
      className={`scroll-pill ${className}`}
      sx={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        fontWeight: 500,
        padding: '12px 24px',
        fontSize: '0.875rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    />
  );
};

export default ScrollPill;