import React, { useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { layout } from '../../styles/layout';
import { Eye, EyeOff } from 'lucide-react';

interface TDTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email';
  disabled?: boolean;
  error?: boolean;
  style?: React.CSSProperties;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const TDTextField: React.FC<TDTextFieldProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error = false,
  style,
  autoCapitalize = 'none',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: layout.inputFieldHeight,
    backgroundColor: colors.neutral[50],
    borderRadius: layout.inputFieldCornerRadius,
    border: `1px solid ${error ? colors.semantic.error : isFocused ? colors.primary[500] : colors.neutral[300]}`,
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${layout.inputPadding}px`,
    transition: 'border-color 0.2s ease',
    ...style,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    height: '100%',
    backgroundColor: 'transparent',
    fontSize: typography.mediumHeader3.fontSize,
    fontWeight: typography.mediumHeader3.fontWeight,
    letterSpacing: typography.mediumHeader3.letterSpacing,
    color: colors.neutral[800],
    border: 'none',
    outline: 'none',
  };

  const toggleButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={inputStyle}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={toggleButtonStyle}
        >
          {showPassword ? (
            <EyeOff size={20} color={colors.neutral[500]} />
          ) : (
            <Eye size={20} color={colors.neutral[500]} />
          )}
        </button>
      )}
    </div>
  );
};
