import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [isVisible]);

  return (
    <>
      <span
        ref={iconRef}
        className="tooltip"
        data-tooltip={text}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && createPortal(
        <span
          className="tooltip__content"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {text}
        </span>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
