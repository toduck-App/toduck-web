import React, { useEffect, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

interface TDToastProps {
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const TDToast: React.FC<TDToastProps> = ({
  message,
  type = 'error',
  visible,
  onHide,
  duration = 3000,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onHide, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible && !isAnimating) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return colors.neutral[700];
      case 'success':
        return colors.semantic.success;
      case 'warning':
        return colors.semantic.warning;
      case 'info':
        return colors.semantic.info;
      default:
        return colors.neutral[700];
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    left: 24,
    right: 24,
    bottom: 80,
    backgroundColor: getBackgroundColor(),
    borderRadius: 8,
    padding: '12px 24px',
    opacity: isAnimating ? 1 : 0,
    transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.3s ease',
    zIndex: 1000,
  };

  const textStyle: React.CSSProperties = {
    color: colors.baseWhite,
    fontSize: typography.mediumBody3.fontSize,
    fontWeight: typography.mediumBody3.fontWeight,
    letterSpacing: typography.mediumBody3.letterSpacing,
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <span style={textStyle}>{message}</span>
    </div>
  );
};
