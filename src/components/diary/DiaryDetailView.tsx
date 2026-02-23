import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { Diary, Emotion } from '../../types';
import { MoreVertical } from 'lucide-react';

// Circle mood images
import happyCircle from '../../assets/images/mood/happy_Circle.png';
import goodCircle from '../../assets/images/mood/good_Circle.png';
import loveCircle from '../../assets/images/mood/love_Circle.png';
import sosoCircle from '../../assets/images/mood/soso_Circle.png';
import sickCircle from '../../assets/images/mood/sick_Circle.png';
import sadCircle from '../../assets/images/mood/sad_Circle.png';
import angryCircle from '../../assets/images/mood/angry_Circle.png';
import anxiousCircle from '../../assets/images/mood/anxiety_Circle.png';
import tiredCircle from '../../assets/images/mood/tired_Circle.png';

// Icons
import penNeutral from '../../assets/icons/pen/penNeutral.png';
import tomatoSmall from '../../assets/images/icons/tomato_Small.png';
import photoIcon from '../../assets/images/icons/photo_Medium.png';

interface DiaryDetailViewProps {
  diary: Diary;
  onEdit?: () => void;
  onDelete?: () => void;
  onImageClick?: (index: number) => void;
}

const emotionCircleImages: Record<Emotion, string> = {
  happy: happyCircle,
  good: goodCircle,
  love: loveCircle,
  soso: sosoCircle,
  sick: sickCircle,
  sad: sadCircle,
  angry: angryCircle,
  anxious: anxiousCircle,
  tired: tiredCircle,
};

// Emotion display names (Korean) - iOS WriteDiaryViewModel mapping
const emotionLabels: Record<Emotion, string> = {
  happy: '기분 좋은 하루',
  good: '마음이 평온했던 하루',
  love: '따뜻함이 느껴진 하루',
  soso: '평범하게 흘러간 하루',
  sick: '몸과 마음이 힘들었던 하루',
  sad: '울컥했던 하루',
  angry: '신경이 곤두섰던 하루',
  anxious: '마음이 불안했던 하루',
  tired: '기운이 빠졌던 하루',
};

export const DiaryDetailView: React.FC<DiaryDetailViewProps> = ({
  diary,
  onEdit,
  onDelete,
  onImageClick,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'M월 d일 (EEE)', { locale: ko });
  };

  const hasKeywords = diary.diaryKeywords && diary.diaryKeywords.length > 0;
  const hasMemo = diary.memo && diary.memo.trim().length > 0;
  const hasPhotos = diary.diaryImageUrls && diary.diaryImageUrls.length > 0;

  // Styles
  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
    borderRadius: 12,
    padding: 16,
  };

  const mainStackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  };

  // Date Header Section
  const dateHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    height: 48,
  };

  const emotionImageStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: '50%',
  };

  const dateInfoStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  };

  const dateLabelStyle: React.CSSProperties = {
    fontSize: typography.mediumCaption1.fontSize,
    fontWeight: typography.mediumCaption1.fontWeight,
    color: colors.neutral[600],
  };

  const titleLabelStyle: React.CSSProperties = {
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: colors.neutral[900],
  };

  const dropdownButtonStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
  };

  const dropdownMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: colors.baseWhite,
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: 110,
    zIndex: 100,
    overflow: 'hidden',
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: colors.neutral[800],
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    width: '100%',
    textAlign: 'left',
  };

  // Section Header Style
  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  const sectionIconStyle: React.CSSProperties = {
    width: 16,
    height: 16,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: typography.boldBody2.fontSize,
    fontWeight: typography.boldBody2.fontWeight,
    color: colors.neutral[600],
  };

  // Keyword Section
  const keywordContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  const keywordTagListStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  };

  // iOS: KeywordChipCell - white bg, 1px neutral300 border, cornerRadius 8, mediumBody2 font
  const keywordTagStyle: React.CSSProperties = {
    padding: '6px 10px',
    backgroundColor: colors.baseWhite,
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 8,
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: colors.neutral[700],
  };

  // Sentence Section
  const sentenceContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  };

  const sentenceContentStyle: React.CSSProperties = {
    fontSize: typography.regularBody4.fontSize,
    fontWeight: typography.regularBody4.fontWeight,
    lineHeight: typography.regularBody4.lineHeight,
    color: colors.neutral[800],
    whiteSpace: 'pre-wrap',
  };

  // Photo Section
  const photoContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginTop: 16,
  };

  const photoGridStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
  };

  const photoStyle: React.CSSProperties = {
    flex: 1,
    aspectRatio: '1',
    borderRadius: 12,
    objectFit: 'cover',
    cursor: 'pointer',
    maxHeight: 160,
  };

  return (
    <div style={containerStyle}>
      <div style={mainStackStyle}>
        {/* Date Header Section */}
        <div style={dateHeaderStyle}>
          <img
            src={emotionCircleImages[diary.emotion]}
            alt={diary.emotion}
            style={emotionImageStyle}
          />
          <div style={dateInfoStyle}>
            <span style={dateLabelStyle}>{formatDate(diary.date)}</span>
            <span style={titleLabelStyle}>
              {diary.title || emotionLabels[diary.emotion]}
            </span>
          </div>
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              style={dropdownButtonStyle}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <MoreVertical size={20} color={colors.neutral[500]} />
            </button>
            {showDropdown && (
              <div style={dropdownMenuStyle}>
                <button
                  style={dropdownItemStyle}
                  onClick={() => {
                    setShowDropdown(false);
                    onEdit?.();
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.neutral[50]}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  수정
                </button>
                <button
                  style={{...dropdownItemStyle, color: colors.semantic.error}}
                  onClick={() => {
                    setShowDropdown(false);
                    onDelete?.();
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.neutral[50]}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Keyword Section */}
        {hasKeywords && (
          <div style={keywordContainerStyle}>
            <div style={sectionHeaderStyle}>
              <img src={tomatoSmall} alt="" style={sectionIconStyle} />
              <span style={sectionTitleStyle}>오늘의 키워드</span>
            </div>
            <div style={keywordTagListStyle}>
              {diary.diaryKeywords.map((keyword) => (
                <span key={keyword.id} style={keywordTagStyle}>
                  {keyword.content}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sentence Section */}
        {hasMemo && (
          <div style={sentenceContainerStyle}>
            <div style={sectionHeaderStyle}>
              <img src={penNeutral} alt="pen" style={sectionIconStyle} />
              <span style={sectionTitleStyle}>문장 기록</span>
            </div>
            <p style={sentenceContentStyle}>{diary.memo}</p>
          </div>
        )}

        {/* Photo Section */}
        {hasPhotos && (
          <div style={photoContainerStyle}>
            <div style={sectionHeaderStyle}>
              <img src={photoIcon} alt="" style={sectionIconStyle} />
              <span style={sectionTitleStyle}>사진 기록</span>
            </div>
            <div style={photoGridStyle}>
              {diary.diaryImageUrls!.slice(0, 2).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`diary-photo-${index}`}
                  style={photoStyle}
                  onClick={() => onImageClick?.(index)}
                />
              ))}
              {diary.diaryImageUrls!.length === 1 && (
                <div style={{ flex: 1 }} /> 
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
