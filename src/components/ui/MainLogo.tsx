import React, { useState, useEffect, useRef } from 'react';
import QuadrantPopup from './QuadrantPopup';
import './MainLogo.css';

interface LogoProps {
  className?: string;
}

const MainLogo: React.FC<LogoProps> = ({ className = '' }) => {
  const [cursorAngle, setCursorAngle] = useState(0);
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef(0);

  const normalizeAngle = (angle: number): number => {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  };

  const getShortestAnglePath = (from: number, to: number): number => {
    const diff = normalizeAngle(to - from);
    return from + diff;
  };

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
        
        const newAngle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
        
        const smoothAngle = getShortestAnglePath(lastAngleRef.current, newAngle);
        
        setCursorAngle(smoothAngle);
        lastAngleRef.current = smoothAngle;
        
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
      
      {/* Quadrant Popups using the universal component */}
      <QuadrantPopup
        position="upper-left"
        isVisible={activeQuadrant === 'upper-left'}
        title="Skills & Technologies"
      >
        <style>{`
          .quadrant-popup.upper-left .quadrant-content h3 {
            border-bottom: 2px solid rgba(255, 255, 255, 0.4);
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
        `}</style>
        <div style={{ 
          marginTop: '20px',
          fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
          <h4 style={{ 
            fontSize: '17px', 
            fontWeight: '700', 
            marginBottom: '10px',
            marginTop: '0',
            color: 'white',
            letterSpacing: '0.3px'
          }}>Front End</h4>
          <div style={{ 
            fontSize: '14px', 
            lineHeight: '1.8',
            marginLeft: '12px',
            marginBottom: '18px',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{ marginBottom: '6px' }}>- Javascript  - Typescript  - CSS  - html</div>
            <div>- React  - React Native  - Tailwind  - Bootstrap</div>
          </div>

          <h4 style={{ 
            fontSize: '17px', 
            fontWeight: '700', 
            marginBottom: '10px',
            marginTop: '0',
            color: 'white',
            letterSpacing: '0.3px'
          }}>Back End</h4>
          <div style={{ 
            fontSize: '14px', 
            lineHeight: '1.8',
            marginLeft: '12px',
            marginBottom: '18px',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            <div>- Python  - Java  - Express.js</div>
          </div>

          <h4 style={{ 
            fontSize: '17px', 
            fontWeight: '700', 
            marginBottom: '10px',
            marginTop: '0',
            color: 'white',
            letterSpacing: '0.3px'
          }}>Database</h4>
          <div style={{ 
            fontSize: '14px', 
            lineHeight: '1.8',
            marginLeft: '12px',
            marginBottom: '18px',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            <div>- PostgreSQL  - MySQL  - MongoDB  - BigQuery</div>
          </div>

          <h4 style={{ 
            fontSize: '17px', 
            fontWeight: '700', 
            marginBottom: '10px',
            marginTop: '0',
            color: 'white',
            letterSpacing: '0.3px'
          }}>Additional</h4>
          <div style={{ 
            fontSize: '14px', 
            lineHeight: '1.8',
            marginLeft: '12px',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            <div>- Docker  - Kubernetes  - GCP  - AWS</div>
          </div>
        </div>
      </QuadrantPopup>

      <QuadrantPopup
        position="upper-right"
        isVisible={activeQuadrant === 'upper-right'}
        title="Experience"
        content="5+ years in full-stack development"
      />

      <QuadrantPopup
        position="lower-right"
        isVisible={activeQuadrant === 'lower-right'}
        title="Projects"
        content="Web apps, APIs, mobile solutions"
      />

      <QuadrantPopup
        position="lower-left"
        isVisible={activeQuadrant === 'lower-left'}
        title="Contact"
        content="Let's build something amazing!"
      />
    </div>
  );
};

export default MainLogo;