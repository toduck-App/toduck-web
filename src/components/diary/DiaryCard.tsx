import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Lottie from 'lottie-react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { Diary } from '../../types';
import { getEmotionInfo, getEmotionLottie } from './EmotionPicker';

interface DiaryCardProps {
  diary: Diary;
  onClick?: () => void;
}

export const DiaryCard: React.FC<DiaryCardProps> = ({ diary, onClick }) => {
  const emotionInfo = getEmotionInfo(diary.emotion);
  const emotionLottie = getEmotionLottie(diary.emotion);

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
    borderRadius: 20,
    padding: 20,
    border: `1px solid ${colors.neutral[200]}`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  };

  const dateStyle: React.CSSProperties = {
    fontSize: typography.mediumCaption1.fontSize,
    fontWeight: typography.mediumCaption1.fontWeight,
    color: colors.neutral[600],
  };

  const emotionBadgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    backgroundColor: emotionInfo?.color || colors.neutral[100],
    borderRadius: 16,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.boldBody1.fontSize,
    fontWeight: typography.boldBody1.fontWeight,
    color: colors.neutral[800],
    marginBottom: 8,
    lineHeight: 1.4,
  };

  const memoStyle: React.CSSProperties = {
    fontSize: typography.regularBody2.fontSize,
    fontWeight: typography.regularBody2.fontWeight,
    color: colors.neutral[700],
    lineHeight: 1.6,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    marginBottom: 16,
  };

  const imagesContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
    overflowX: 'auto',
  };

  const imageStyle: React.CSSProperties = {
    width: 72,
    height: 72,
    borderRadius: 12,
    objectFit: 'cover',
    backgroundColor: colors.neutral[100],
    flexShrink: 0,
  };

  const keywordsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  };

  const keywordStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    fontSize: typography.regularCaption1.fontSize,
    color: colors.neutral[700],
  };

  return (
    <div style={containerStyle} onClick={onClick}>
      <div style={headerStyle}>
        <span style={dateStyle}>
          {format(new Date(diary.date), 'M월 d일 EEEE', { locale: ko })}
        </span>
        <div style={emotionBadgeStyle}>
          {emotionLottie && (
            <div style={{ width: 20, height: 20 }}>
              <Lottie
                animationData={emotionLottie}
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}
          <span
            style={{
              fontSize: typography.mediumCaption2.fontSize,
              fontWeight: typography.boldCaption2.fontWeight,
              color: colors.neutral[800],
            }}
          >
            {emotionInfo?.label}
          </span>
        </div>
      </div>

      {diary.title && <div style={titleStyle}>{diary.title}</div>}

      {diary.memo && <div style={memoStyle}>{diary.memo}</div>}

      {diary.diaryImageUrls && diary.diaryImageUrls.length > 0 && (
        <div style={imagesContainerStyle}>
          {diary.diaryImageUrls.slice(0, 4).map((url, index) => (
            <img key={index} src={url} alt="" style={imageStyle} />
          ))}
          {diary.diaryImageUrls.length > 4 && (
            <div
              style={{
                ...imageStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.neutral[200],
                fontSize: typography.mediumCaption1.fontSize,
                fontWeight: typography.boldCaption1.fontWeight,
                color: colors.neutral[600],
              }}
            >
              +{diary.diaryImageUrls.length - 4}
            </div>
          )}
        </div>
      )}

      {diary.diaryKeywords && diary.diaryKeywords.length > 0 && (
        <div style={keywordsContainerStyle}>
          {diary.diaryKeywords.map((keyword) => (
            <span key={keyword.id} style={keywordStyle}>
              #{keyword.content}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
