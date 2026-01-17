import React, { useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TDButton } from '../common/TDButton';
import { TDLabel } from '../common/TDLabel';
import { TDAvatar } from '../common/TDAvatar';
import { User } from '../../types';
import { X, Camera } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSave: (data: { nickname: string; profileImageUrl?: string }) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
}) => {
  const [nickname, setNickname] = useState(user.nickname);
  const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNickname(user.nickname);
      setProfileImageUrl(user.profileImageUrl);
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, user]);

  if (!shouldRender) return null;

  const handleSave = () => {
    if (!nickname.trim()) return;
    onSave({ nickname: nickname.trim(), profileImageUrl });
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 24,
    transition: 'background-color 0.3s ease',
  };

  const modalStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.baseWhite,
    borderRadius: 20,
    overflow: 'hidden',
    transform: isAnimating ? 'scale(1)' : 'scale(0.9)',
    opacity: isAnimating ? 1 : 0,
    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottom: `1px solid ${colors.neutral[200]}`,
  };

  const contentStyle: React.CSSProperties = {
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const avatarContainerStyle: React.CSSProperties = {
    position: 'relative',
    marginBottom: 24,
  };

  const cameraButtonStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    border: `2px solid ${colors.baseWhite}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  const inputContainerStyle: React.CSSProperties = {
    width: '100%',
    marginBottom: 24,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 8,
    fontSize: typography.boldBody2.fontSize,
    fontWeight: typography.boldBody2.fontWeight,
    color: colors.neutral[800],
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: colors.neutral[50],
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 12,
    fontSize: typography.mediumBody1.fontSize,
    color: colors.neutral[800],
    outline: 'none',
    textAlign: 'center',
  };

  const footerStyle: React.CSSProperties = {
    padding: '0 24px 24px',
    display: 'flex',
    gap: 12,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <TDLabel
            text="프로필 수정"
            font="boldHeader5"
            color={colors.neutral[800]}
          />
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={24} color={colors.neutral[600]} />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Avatar */}
          <div style={avatarContainerStyle}>
            <TDAvatar src={profileImageUrl} size="large" />
            <button style={cameraButtonStyle}>
              <Camera size={16} color={colors.baseWhite} />
            </button>
          </div>

          {/* Nickname Input */}
          <div style={inputContainerStyle}>
            <label style={labelStyle}>닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              style={inputStyle}
              maxLength={20}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <TDButton
            title="취소"
            variant="outline"
            onClick={onClose}
            style={{ flex: 1 }}
          />
          <TDButton
            title="저장"
            disabled={!nickname.trim()}
            onClick={handleSave}
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
};
