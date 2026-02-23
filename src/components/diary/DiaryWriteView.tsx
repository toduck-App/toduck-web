import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TDLabel } from '../common/TDLabel';
import { DiaryEmotionStep } from './DiaryEmotionStep';
import { DiaryKeywordStep } from './DiaryKeywordStep';
import { DiaryContentStep } from './DiaryContentStep';
import { DiaryCompleteStep } from './DiaryCompleteStep';
import { Emotion, Diary, DiaryKeyword, DiaryWriteStep, DiaryStreakInfo } from '../../types';
import { diaryService } from '../../services/diaryService';
import { ChevronLeft, X } from 'lucide-react';

interface DiaryWriteViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (diary: Partial<Diary>) => Promise<void>;
  onOpenSimpleDiary: () => void;
  selectedDate: Date;
}

interface DiaryFormData {
  emotion: Emotion | null;
  keywords: DiaryKeyword[];
  title: string;
  memo: string;
  images: File[];
  imageUrls: string[];
}

export const DiaryWriteView: React.FC<DiaryWriteViewProps> = ({
  isOpen,
  onClose,
  onSave,
  onOpenSimpleDiary,
  selectedDate,
}) => {
  const [step, setStep] = useState<DiaryWriteStep>('emotion');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [streakInfo, setStreakInfo] = useState<DiaryStreakInfo>({
    currentStreak: 0,
    weeklyStreak: [false, false, false, false, false, false, false],
  });

  const [formData, setFormData] = useState<DiaryFormData>({
    emotion: null,
    keywords: [],
    title: '',
    memo: '',
    images: [],
    imageUrls: [],
  });

  // Animation effect
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        // Reset form and step when closing
        setStep('emotion');
        setFormData({
          emotion: null,
          keywords: [],
          title: '',
          memo: '',
          images: [],
          imageUrls: [],
        });
        // Unlock body scroll
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleEmotionSelect = (emotion: Emotion) => {
    setFormData((prev) => ({ ...prev, emotion }));
    setStep('keyword');
  };

  const handleKeywordNext = (keywords: DiaryKeyword[]) => {
    setFormData((prev) => ({ ...prev, keywords }));
    setStep('content');
  };

  const handleKeywordSkip = () => {
    setFormData((prev) => ({ ...prev, keywords: [] }));
    setStep('content');
  };

  const handleContentSave = async (title: string, memo: string, images: File[], imageUrls: string[]) => {
    setFormData((prev) => ({ ...prev, title, memo, images, imageUrls }));
    setIsSaving(true);

    try {
      await onSave({
        date: format(selectedDate, 'yyyy-MM-dd'),
        emotion: formData.emotion!,
        title,
        memo,
        diaryImageUrls: imageUrls,
        diaryKeywords: formData.keywords,
      });

      // Fetch streak info for completion screen
      try {
        const streakData = await diaryService.fetchWeeklyStreak();
        setStreakInfo(streakData);
      } catch {
        // Use default streak info if fetch fails
      }

      setStep('complete');
    } catch (error) {
      console.error('Failed to save diary:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentSkip = async () => {
    await handleContentSave('', '', [], []);
  };

  const handleBack = () => {
    if (step === 'keyword') {
      setStep('emotion');
    } else if (step === 'content') {
      setStep('keyword');
    }
  };

  const handleComplete = () => {
    onClose();
  };

  const getStepNumber = useCallback((): number => {
    switch (step) {
      case 'emotion':
        return 1;
      case 'keyword':
        return 2;
      case 'content':
        return 3;
      default:
        return 0;
    }
  }, [step]);

  if (!shouldRender) return null;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.baseWhite,
    display: 'flex',
    flexDirection: 'column',
    transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
    zIndex: 1000,
    maxWidth: 430,
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    padding: '0 4px',
    backgroundColor: colors.baseWhite,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: colors.baseWhite,
  };

  // Progress bar component matching iOS NavigationProgressView
  const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div
      style={{
        flex: 1,
        height: 8,
        backgroundColor: colors.neutral[200],
        borderRadius: 4,
        overflow: 'hidden',
        margin: '0 12px',
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: '100%',
          backgroundColor: colors.primary[400],
          borderRadius: 4,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );

  // Page indicator matching iOS style "1 / 3"
  const PageIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
    <div style={{ display: 'flex', alignItems: 'center', minWidth: 44, justifyContent: 'center' }}>
      <span
        style={{
          fontSize: typography.boldBody2.fontSize,
          fontWeight: typography.boldBody2.fontWeight,
          color: colors.primary[500],
        }}
      >
        {current}
      </span>
      <span
        style={{
          fontSize: typography.mediumBody2.fontSize,
          color: colors.neutral[500],
          marginLeft: 2,
        }}
      >
        / {total}
      </span>
    </div>
  );

  const renderHeader = () => {
    const stepNumber = getStepNumber();
    const progress = stepNumber / 3;

    // iOS: Complete step has no header
    if (step === 'complete') {
      return null;
    }

    return (
      <div style={headerStyle}>
        {step === 'emotion' ? (
          <button
            onClick={onClose}
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={24} color={colors.neutral[800]} />
          </button>
        ) : (
          <button
            onClick={handleBack}
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={24} color={colors.neutral[800]} />
          </button>
        )}

        <ProgressBar progress={progress} />

        <PageIndicator current={stepNumber} total={3} />
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 'emotion':
        return (
          <DiaryEmotionStep
            selectedEmotion={formData.emotion}
            onSelectEmotion={handleEmotionSelect}
            onOpenSimpleDiary={onOpenSimpleDiary}
          />
        );
      case 'keyword':
        return (
          <DiaryKeywordStep
            selectedKeywords={formData.keywords}
            onNext={handleKeywordNext}
            onSkip={handleKeywordSkip}
          />
        );
      case 'content':
        return (
          <DiaryContentStep
            emotion={formData.emotion!}
            title={formData.title}
            memo={formData.memo}
            images={formData.images}
            imageUrls={formData.imageUrls}
            onSave={handleContentSave}
            onSkip={handleContentSkip}
            isSaving={isSaving}
          />
        );
      case 'complete':
        return (
          <DiaryCompleteStep
            emotion={formData.emotion!}
            streakInfo={streakInfo}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      {renderHeader()}
      <div style={contentStyle}>{renderStep()}</div>
    </div>
  );
};
