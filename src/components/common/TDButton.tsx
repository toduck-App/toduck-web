import React from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { layout } from '../../styles/layout';

interface TDButtonProps {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'medium' | 'large';
  fullWidth?: boolean;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
}

export const TDButton: React.FC<TDButtonProps> = ({
  title,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'large',
  fullWidth = true,
  style,
  icon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) {
      // iOS: TDColor.Neutral.neutral100
      return colors.neutral[100];
    }
    switch (variant) {
      case 'primary':
        return colors.primary[500];
      case 'secondary':
        return colors.neutral[50];
      case 'outline':
        return colors.baseWhite;
      default:
        return colors.primary[500];
    }
  };

  const getTextColor = () => {
    if (disabled) {
      // iOS: TDColor.Neutral.neutral500
      return colors.neutral[500];
    }
    switch (variant) {
      case 'primary':
        return colors.baseWhite;
      case 'secondary':
        return colors.neutral[800];
      case 'outline':
        return colors.neutral[700];
      default:
        return colors.baseWhite;
    }
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return `1px solid ${disabled ? colors.neutral[300] : colors.neutral[300]}`;
    }
    return 'none';
  };

  const buttonStyle: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    height: size === 'large' ? layout.buttonHeight : 40,
    backgroundColor: getBackgroundColor(),
    color: getTextColor(),
    border: getBorder(),
    borderRadius: layout.buttonCornerRadius,
    fontWeight: typography.boldHeader5.fontWeight,
    fontSize: typography.boldHeader5.fontSize,
    letterSpacing: typography.boldHeader5.letterSpacing,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
    >
      {icon && <span style={{ display: 'flex', marginRight: 8 }}>{icon}</span>}
      {title}
    </button>
  );
};

// Floating Action Button variant (iOS TDBaseButton style)
interface TDFloatingButtonProps {
  title: string;
  onClick?: () => void;
  showIcon?: boolean;
  style?: React.CSSProperties;
}

export const TDFloatingButton: React.FC<TDFloatingButtonProps> = ({
  title,
  onClick,
  showIcon = true,
  style,
}) => {
  const buttonStyle: React.CSSProperties = {
    width: layout.social.addPostButtonWidth,
    height: layout.social.addPostButtonHeight,
    backgroundColor: colors.primary[500],
    color: colors.baseWhite,
    border: 'none',
    borderRadius: layout.social.addPostButtonRadius,
    fontWeight: typography.boldHeader4.fontWeight,
    fontSize: typography.boldHeader4.fontSize,
    letterSpacing: typography.boldHeader4.letterSpacing,
    cursor: 'pointer',
    // iOS style: no shadow by default (setShadow() is optional)
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    ...style,
  };

  // Plus icon SVG matching iOS addSmall icon
  const PlusIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 3V13M3 8H13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <button onClick={onClick} style={buttonStyle}>
      {showIcon && <PlusIcon />}
      {title}
    </button>
  );
};
