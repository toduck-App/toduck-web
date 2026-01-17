import React from 'react';
import { typography, TypographyToken } from '../../styles/typography';
import { colors } from '../../styles/colors';

interface TDLabelProps {
  text: string;
  font?: TypographyToken;
  color?: string;
  style?: React.CSSProperties;
  maxLines?: number;
  onClick?: () => void;
}

export const TDLabel: React.FC<TDLabelProps> = ({
  text,
  font = 'mediumBody1',
  color = colors.neutral[800],
  style,
  maxLines,
  onClick,
}) => {
  const fontStyle = typography[font];

  const labelStyle: React.CSSProperties = {
    fontSize: fontStyle.fontSize,
    fontWeight: fontStyle.fontWeight,
    lineHeight: fontStyle.lineHeight,
    letterSpacing: fontStyle.letterSpacing,
    color,
    ...(maxLines && {
      display: '-webkit-box',
      WebkitLineClamp: maxLines,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    }),
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  return (
    <span onClick={onClick} style={labelStyle}>
      {text}
    </span>
  );
};
