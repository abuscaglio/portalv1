import React, { useState, useEffect, useRef } from 'react';
import './MainLogo.css';

interface LogoProps {
  className?: string;
}

const MainLogo: React.FC<LogoProps> = ({ className = '' }) => {
  const [cursorAngle, setCursorAngle] = useState(0);
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef(0);

  // Function to normalize angle to -180 to 180 range
  const normalizeAngle = (angle: number): number => {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  };

  // Function to find the shortest path between two angles
  const getShortestAnglePath = (from: number, to: number): number => {
    const diff = normalizeAngle(to - from);
    return from + diff;
  };

  // Function to determine which quadrant the angle is in
  const getActiveQuadrant = (angle: number): string | null => {
    const normalizedAngle = normalizeAngle(angle);
    
    if (normalizedAngle >= -90 && normalizedAngle <= 0) {
      return 'upper-left';
    } else if (normalizedAngle >= 0 && normalizedAngle <= 90) {
      return 'upper-right';
    } else if (normalizedAngle >= 90 && normalizedAngle <= 180) {
      return 'lower-right';
    } else if (normalizedAngle >= -180 && normalizedAngle <= -90) {
      return 'lower-left';
    }
    
    return null;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (badgeRef.current) {
        const badgeRect = badgeRef.current.getBoundingClientRect();
        const badgeCenterX = badgeRect.left + badgeRect.width / 2;
        const badgeCenterY = badgeRect.top + badgeRect.height / 2;
        
        const deltaX = e.clientX - badgeCenterX;
        const deltaY = e.clientY - badgeCenterY;
        
        // Calculate angle in degrees (0 degrees = top, clockwise)
        const newAngle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
        
        // Find the shortest path to the new angle
        const smoothAngle = getShortestAnglePath(lastAngleRef.current, newAngle);
        
        setCursorAngle(smoothAngle);
        lastAngleRef.current = smoothAngle;
        
        // Determine which quadrant is active
        setActiveQuadrant(getActiveQuadrant(smoothAngle));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });

  return (
    <div className={`main-logo-container ${className}`}>
      {/* Dynamic Badge Container */}
      <div className="main-logo-badge-container" ref={badgeRef}>
        {/* Static Orbital Ring */}
        <div className="main-logo-orbital-ring" />
        
        {/* Quadrant indicators (visual debug) */}
        <div className="main-logo-quadrant-indicator upper-left" />
        <div className="main-logo-quadrant-indicator upper-right" />
        <div className="main-logo-quadrant-indicator lower-right" />
        <div className="main-logo-quadrant-indicator lower-left" />
        
        {/* Cursor-Following Container */}
        <div 
          className="main-logo-cursor-container"
          style={{ transform: `rotate(${cursorAngle}deg)` }}
        >
          {/* Following Dot */}
          <div className="main-logo-orbiting-dot" />
        </div>
        
        {/* Main Badge */}
        <div className="main-logo-badge">
          {/* Inner Border Ring */}
          <div className="main-logo-inner-ring" />
          AB
        </div>
      </div>

      {/* Text Content */}
      <div className="main-logo-text-container">
        <div className="main-logo-name">
          Andrew Buscaglio
        </div>
        <div className="main-logo-title">
          FULL STACK DEVELOPER
        </div>
      </div>
      
      {/* Upper Left Quadrant Component */}
      <div 
        className={`main-logo-quadrant-component upper-left ${activeQuadrant === 'upper-left' ? 'visible' : ''}`}
      >
        <div className="quadrant-content">
          <h3>Skills & Technologies</h3>
          <p>React, TypeScript, Node.js, Python</p>
        </div>
      </div>

      {/* Upper Right Quadrant Component */}
      <div 
        className={`main-logo-quadrant-component upper-right ${activeQuadrant === 'upper-right' ? 'visible' : ''}`}
      >
        <div className="quadrant-content">
          <h3>Experience</h3>
          <p>5+ years in full-stack development</p>
        </div>
      </div>

      {/* Lower Right Quadrant Component */}
      <div 
        className={`main-logo-quadrant-component lower-right ${activeQuadrant === 'lower-right' ? 'visible' : ''}`}
      >
        <div className="quadrant-content">
          <h3>Projects</h3>
          <p>Web apps, APIs, mobile solutions</p>
        </div>
      </div>

      {/* Lower Left Quadrant Component */}
      <div 
        className={`main-logo-quadrant-component lower-left ${activeQuadrant === 'lower-left' ? 'visible' : ''}`}
      >
        <div className="quadrant-content">
          <h3>Contact</h3>
          <p>Let's build something amazing!</p>
        </div>
      </div>
    </div>
  );
};

export default MainLogo;