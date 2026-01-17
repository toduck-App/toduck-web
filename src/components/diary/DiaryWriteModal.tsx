import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TDButton } from '../common/TDButton';
import { TDLabel } from '../common/TDLabel';
import { EmotionPicker } from './EmotionPicker';
import { Emotion, Diary } from '../../types';
import { X, Camera } from 'lucide-react';

interface DiaryWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (diary: Partial<Diary>) => void;
  selectedDate: Date;
  existingDiary?: Diary;
}

export const DiaryWriteModal: React.FC<DiaryWriteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  existingDiary,
}) => {
  const [emotion, setEmotion] = useState<Emotion | null>(existingDiary?.emotion || null);
  const [title, setTitle] = useState(existingDiary?.title || '');
  const [memo, setMemo] = useState(existingDiary?.memo || '');
  const [step, setStep] = useState<'emotion' | 'content'>(existingDiary ? 'content' : 'emotion');
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
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleSave = () => {
    if (!emotion) return;

    onSave({
      date: format(selectedDate, 'yyyy-MM-dd'),
      emotion,
      title,
      memo,
    });
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
    padding: '0 16px',
  };

  const footerStyle: React.CSSProperties = {
    padding: 16,
    borderTop: `1px solid ${colors.neutral[200]}`,
  };

  const inputContainerStyle: React.CSSProperties = {
    marginBottom: 20,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 8,
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.boldBody2.fontWeight,
    color: colors.neutral[800],
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
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 150,
    resize: 'vertical',
    lineHeight: 1.6,
  };

  const imageUploadStyle: React.CSSProperties = {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    border: `1px dashed ${colors.neutral[400]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <TDLabel
            text={format(selectedDate, 'M월 d일 EEEE', { locale: ko })}
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
          {step === 'emotion' ? (
            <div style={{ padding: '20px 0' }}>
              <TDLabel
                text="오늘 기분이 어떠셨나요?"
                font="boldHeader4"
                color={colors.neutral[800]}
                style={{ display: 'block', marginBottom: 4 }}
              />
              <TDLabel
                text="기분을 선택해주세요"
                font="mediumBody2"
                color={colors.neutral[600]}
                style={{ display: 'block', marginBottom: 20 }}
              />
              <EmotionPicker
                selectedEmotion={emotion}
                onSelectEmotion={(e) => {
                  setEmotion(e);
                  setStep('content');
                }}
              />
            </div>
          ) : (
            <div style={{ padding: '20px 0' }}>
              <div style={inputContainerStyle}>
                <label style={labelStyle}>제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="일기 제목을 입력하세요"
                  style={inputStyle}
                />
              </div>

              <div style={inputContainerStyle}>
                <label style={labelStyle}>내용</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="오늘 하루를 기록해보세요"
                  style={textareaStyle}
                />
              </div>

              <div style={inputContainerStyle}>
                <label style={labelStyle}>사진 첨부</label>
                <div style={imageUploadStyle}>
                  <Camera size={24} color={colors.neutral[400]} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          {step === 'emotion' ? (
            <TDButton
              title="다음"
              disabled={!emotion}
              onClick={() => setStep('content')}
            />
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <TDButton
                title="이전"
                variant="outline"
                onClick={() => setStep('emotion')}
                style={{ flex: 1 }}
              />
              <TDButton
                title={existingDiary ? '수정하기' : '저장하기'}
                disabled={!emotion}
                onClick={handleSave}
                style={{ flex: 2 }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
