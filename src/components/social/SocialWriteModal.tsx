import React, { useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TDButton } from '../common/TDButton';
import { TDLabel } from '../common/TDLabel';
import { TDChipCollection } from '../common/TDChip';
import { PostCategory } from '../../types';
import { X, Camera, Lock, Globe } from 'lucide-react';

interface SocialWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title?: string;
    content: string;
    categories: PostCategory[];
    isAnonymous: boolean;
    images?: string[];
  }) => void;
}

const categoryOptions = [
  { id: 'concentration', label: '집중' },
  { id: 'memory', label: '기억' },
  { id: 'mistake', label: '실수' },
  { id: 'anxiety', label: '불안' },
  { id: 'information', label: '정보' },
];

export const SocialWriteModal: React.FC<SocialWriteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        // Reset form
        setTitle('');
        setContent('');
        setSelectedCategories([]);
        setIsAnonymous(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;

    onSubmit({
      title: title.trim() || undefined,
      content: content.trim(),
      categories: selectedCategories as PostCategory[],
      isAnonymous,
    });
    onClose();
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1000,
    transition: 'background-color 0.3s ease',
  };

  const modalStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 430,
    backgroundColor: colors.baseWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottom: `1px solid ${colors.neutral[200]}`,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
  };

  const footerStyle: React.CSSProperties = {
    padding: 16,
    borderTop: `1px solid ${colors.neutral[200]}`,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: colors.neutral[50],
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 12,
    fontSize: typography.mediumBody1.fontSize,
    color: colors.neutral[800],
    outline: 'none',
    marginBottom: 16,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 200,
    resize: 'vertical',
    lineHeight: 1.6,
    marginBottom: 16,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 20,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: typography.boldBody2.fontSize,
    fontWeight: typography.boldBody2.fontWeight,
    color: colors.neutral[800],
    marginBottom: 12,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <TDLabel
            text="글 작성"
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
          {/* Title */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>제목 (선택)</div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              style={inputStyle}
            />
          </div>

          {/* Content */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>내용</div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력해주세요"
              style={textareaStyle}
            />
          </div>

          {/* Categories */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>카테고리</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categoryOptions.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryToggle(cat.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      backgroundColor: isSelected ? colors.primary[500] : colors.neutral[100],
                      color: isSelected ? colors.baseWhite : colors.neutral[700],
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: typography.mediumCaption1.fontSize,
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anonymous toggle */}
          <div style={sectionStyle}>
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                borderRadius: 12,
                backgroundColor: isAnonymous ? colors.primary[50] : colors.neutral[100],
                border: isAnonymous ? `1px solid ${colors.primary[300]}` : `1px solid ${colors.neutral[200]}`,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {isAnonymous ? (
                <Lock size={18} color={colors.primary[500]} />
              ) : (
                <Globe size={18} color={colors.neutral[600]} />
              )}
              <span
                style={{
                  fontSize: typography.mediumBody2.fontSize,
                  color: isAnonymous ? colors.primary[600] : colors.neutral[700],
                }}
              >
                {isAnonymous ? '익명으로 작성' : '닉네임으로 작성'}
              </span>
            </button>
          </div>

          {/* Image upload */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>사진 첨부</div>
            <button
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                backgroundColor: colors.neutral[100],
                border: `1px dashed ${colors.neutral[400]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Camera size={24} color={colors.neutral[400]} />
            </button>
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
            title="게시하기"
            disabled={!content.trim()}
            onClick={handleSubmit}
            style={{ flex: 2 }}
          />
        </div>
      </div>
    </div>
  );
};
