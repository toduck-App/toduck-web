import React from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { layout } from '../../styles/layout';
import { TDLabel } from '../common/TDLabel';
import { Pencil, Share2 } from 'lucide-react';

interface MyPageSocialButtonProps {
  onProfileClick?: () => void;
  onShareClick?: () => void;
}

export const MyPageSocialButton: React.FC<MyPageSocialButtonProps> = ({
  onProfileClick,
  onShareClick,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: layout.myPage.menuStackViewSpacing,
    padding: `8px ${layout.containerHorizontalPadding}px 20px`,
    backgroundColor: colors.baseWhite,
  };

  const buttonStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 16px',
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <button onClick={onProfileClick} style={buttonStyle}>
        <Pencil size={18} color={colors.neutral[700]} />
        <TDLabel text="프로필" font="mediumBody2" color={colors.neutral[700]} />
      </button>

      <button onClick={onShareClick} style={buttonStyle}>
        <Share2 size={18} color={colors.neutral[700]} />
        <TDLabel text="공유하기" font="mediumBody2" color={colors.neutral[700]} />
      </button>
    </div>
  );
};
