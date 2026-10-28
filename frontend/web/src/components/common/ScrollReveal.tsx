'use client';

import React, { useEffect, useRef, useState } from 'react';

export type RevealEffect = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade';

interface ScrollRevealProps {
  children: React.ReactNode;
  effect?: RevealEffect;
  delay?: number; // in milliseconds
  duration?: number; // in milliseconds
  threshold?: number; // 0 to 1
  className?: string;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  effect = 'fade-up',
  delay = 0,
  duration = 750,
  threshold = 0.12,
  className = '',
  once = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check if IntersectionObserver is available
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  // Initial hidden states according to effect
  const getInitialStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      transitionProperty: 'opacity, transform',
      transitionDuration: `${duration}ms`,
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      transitionDelay: `${delay}ms`,
      willChange: 'opacity, transform',
    };

    if (isVisible) {
      return {
        ...baseStyle,
        opacity: 1,
        transform: 'translate3d(0, 0, 0) scale(1)',
      };
    }

    switch (effect) {
      case 'fade-up':
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'translate3d(0, 36px, 0)',
        };
      case 'fade-down':
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'translate3d(0, -36px, 0)',
        };
      case 'fade-left':
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'translate3d(-40px, 0, 0)',
        };
      case 'fade-right':
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'translate3d(40px, 0, 0)',
        };
      case 'zoom-in':
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'scale(0.93)',
        };
      case 'fade':
      default:
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'none',
        };
    }
  };

  return (
    <div ref={elementRef} style={getInitialStyle()} className={className}>
      {children}
    </div>
  );
};
