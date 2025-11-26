import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import tooltipIcon from '../../assets/images/icon-tooltip.png';
import './Tooltip.css';

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, showIcon = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY - 8,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [isVisible]);

  return (
    <>
      <span
        ref={triggerRef}
        className="tooltip-trigger-wrapper"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        {showIcon && (
          <img src={tooltipIcon} alt="tooltip" className="tooltip-icon" />
        )}
      </span>
      {isVisible &&
        createPortal(
          <span className="tooltip-content" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
            {text}
          </span>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
