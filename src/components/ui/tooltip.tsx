import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 300,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    let x = 0;
    let y = 0;

    switch (placement) {
      case 'top':
        x = rect.left + scrollX + rect.width / 2;
        y = rect.top + scrollY - 10;
        break;
      case 'bottom':
        x = rect.left + scrollX + rect.width / 2;
        y = rect.bottom + scrollY + 10;
        break;
      case 'left':
        x = rect.left + scrollX - 10;
        y = rect.top + scrollY + rect.height / 2;
        break;
      case 'right':
        x = rect.right + scrollX + 10;
        y = rect.top + scrollY + rect.height / 2;
        break;
    }

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    updatePosition();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const triggerElement = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  const getTransformOrigin = () => {
    switch (placement) {
      case 'top':
        return 'bottom center';
      case 'bottom':
        return 'top center';
      case 'left':
        return 'right center';
      case 'right':
        return 'left center';
      default:
        return 'center';
    }
  };

  return (
    <>
      {triggerElement}
      {isVisible && (
        <div
          className={`
            fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-800 rounded-md shadow-lg pointer-events-none
            max-w-xs break-words animate-fade-in-scale ${className}
          `}
          style={{
            left: placement === 'left' ? position.x - 8 : 
                  placement === 'right' ? position.x + 8 : 
                  position.x,
            top: placement === 'top' ? position.y - 8 : 
                 placement === 'bottom' ? position.y + 8 : 
                 position.y,
            transform: placement === 'top' || placement === 'bottom' 
              ? 'translateX(-50%)' 
              : placement === 'left' || placement === 'right'
              ? 'translateY(-50%)'
              : 'translate(-50%, -50%)',
            transformOrigin: getTransformOrigin()
          }}
        >
          {content}
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45 ${
              placement === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' :
              placement === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' :
              placement === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2' :
              'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </>
  );
};

Tooltip.displayName = "Tooltip";

export { Tooltip };

