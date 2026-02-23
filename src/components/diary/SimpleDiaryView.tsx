import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TDLabel } from '../common/TDLabel';
import { Emotion, Diary, DiaryKeyword } from '../../types';
import { emotions } from './EmotionPicker';
import { KeywordSheet } from './KeywordSheet';
import { ChevronLeft, Plus, X } from 'lucide-react';

// Icons
import tomatoSmall from '../../assets/images/icons/tomato_Small.png';
import penNeutral from '../../assets/icons/pen/penNeutral.png';
import photoIcon from '../../assets/images/icons/photo_Medium.png';

interface SimpleDiaryViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (diary: Partial<Diary>) => Promise<void>;
  onDelete?: () => Promise<void>;
  selectedDate: Date;
  existingDiary?: Diary;
}

const MAX_TITLE_CHARS = 16;
const MAX_MEMO_CHARS = 2000;
const MAX_PHOTOS = 2;

// iOS: Emotion label mapping for auto-fill title
const emotionAutoTitles: Record<Emotion, string> = {
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

export const SimpleDiaryView: React.FC<SimpleDiaryViewProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  existingDiary,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [keywords, setKeywords] = useState<DiaryKeyword[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showKeywordSheet, setShowKeywordSheet] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [keywordsToDelete, setKeywordsToDelete] = useState<Set<number>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isEditMode = !!existingDiary;

  // Initialize state when existingDiary changes or when opening
  useEffect(() => {
    if (isOpen) {
      if (existingDiary) {
        setEmotion(existingDiary.emotion);
        // If title is empty/null, use the auto-generated title based on emotion
        setTitle(existingDiary.title || emotionAutoTitles[existingDiary.emotion] || '');
        setMemo(existingDiary.memo || '');
        setKeywords(existingDiary.diaryKeywords || []);
        setImagePreviews(existingDiary.diaryImageUrls || []);
        setImages([]);
      } else {
        setEmotion(null);
        setTitle('');
        setMemo('');
        setKeywords([]);
        setImages([]);
        setImagePreviews([]);
      }
      setIsDeleteMode(false);
      setKeywordsToDelete(new Set());
    }
  }, [isOpen, existingDiary]);

  // Animation effect
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_CHARS) {
      setTitle(value);
    }
  };

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MEMO_CHARS) {
      setMemo(value);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_PHOTOS - imagePreviews.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImages((prev) => [...prev, ...filesToAdd]);
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeywordSelect = (selectedKeywords: DiaryKeyword[]) => {
    setKeywords(selectedKeywords);
    setShowKeywordSheet(false);
  };

  const handleKeywordClick = (keyword: DiaryKeyword) => {
    if (isDeleteMode) {
      setKeywordsToDelete((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(keyword.id)) {
          newSet.delete(keyword.id);
        } else {
          newSet.add(keyword.id);
        }
        return newSet;
      });
    }
  };

  const handleDeleteKeywords = () => {
    setKeywords((prev) => prev.filter((k) => !keywordsToDelete.has(k.id)));
    setKeywordsToDelete(new Set());
    setIsDeleteMode(false);
  };

  const handleSave = async () => {
    if (!emotion) {
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 2000);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        date: format(selectedDate, 'yyyy-MM-dd'),
        emotion,
        title: title || emotionAutoTitles[emotion],
        memo,
        diaryImageUrls: imagePreviews,
        diaryKeywords: keywords,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save diary:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm('정말 이 일기를 삭제하시겠습니까?')) {
      try {
        await onDelete();
        onClose();
      } catch (error) {
        console.error('Failed to delete diary:', error);
      }
    }
  };

  if (!shouldRender) return null;

  // iOS: Full screen container
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

  // iOS: Header - 56px height
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    padding: '0 16px',
    backgroundColor: colors.baseWhite,
    flexShrink: 0,
  };

  // iOS: Scroll content with stack spacing 32
  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '0 16px',
  };

  const stackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
    paddingTop: 24,
    paddingBottom: 140,
  };

  // iOS: Section header with icon
  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  };

  const sectionTitleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  const sectionIconStyle: React.CSSProperties = {
    width: 16,
    height: 16,
  };

  // iOS: Emotion picker - horizontal scroll, 50x50 cells, spacing 14
  const emotionScrollStyle: React.CSSProperties = {
    display: 'flex',
    gap: 14,
    overflowX: 'auto',
    padding: '4px 0',
    WebkitOverflowScrolling: 'touch',
  };

  // iOS: Emotion cell - 50x50, opacity-based selection (no border)
  // Selected: alpha 1.0, Unselected: alpha 0.3
  const getEmotionCellStyle = (isSelected: boolean, hasSelection: boolean): React.CSSProperties => ({
    width: 50,
    height: 50,
    borderRadius: 25,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    backgroundColor: 'transparent',
    padding: 0,
    opacity: hasSelection ? (isSelected ? 1.0 : 0.3) : 1.0,
    transition: 'opacity 0.2s ease',
  });

  // iOS: TDFormTextField - height 110, border neutral300, radius 8, neutral50 bg
  const formFieldContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const inputContainerStyle: React.CSSProperties = {
    backgroundColor: colors.neutral[50],
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 8,
    padding: '14px 12px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: typography.regularBody4.fontSize,
    fontWeight: typography.regularBody4.fontWeight,
    color: colors.neutral[800],
    outline: 'none',
  };

  // iOS: Character/photo count in header - right aligned, same level as title
  const headerCountStyle: React.CSSProperties = {
    fontSize: typography.regularBody2.fontSize,
    fontWeight: typography.regularBody2.fontWeight,
  };

  // iOS: Keyword tag container - horizontal gap 8px, vertical gap 12px
  const keywordTagContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    rowGap: 12,
    minHeight: 32,
  };

  // iOS: Keyword tag - white bg, 1px neutral300 border, radius 8, mediumBody2
  // Delete mode: only border/text color changes, NO background color change
  const getKeywordTagStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '6px 10px',
    backgroundColor: colors.baseWhite,
    border: `1px solid ${isSelected ? colors.semantic.error : colors.neutral[300]}`,
    borderRadius: 8,
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: isSelected ? colors.semantic.error : colors.neutral[700],
    cursor: isDeleteMode ? 'pointer' : 'default',
  });

  // iOS: Add keyword button - NOT full width, left-aligned, height 32, radius 8, border 1px neutral300
  const addKeywordButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    padding: '0 12px',
    backgroundColor: colors.baseWhite,
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: colors.neutral[700],
  };

  // iOS: Delete mode button - height 20
  const deleteModeBtnStyle: React.CSSProperties = {
    padding: '0 8px',
    height: 20,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: colors.neutral[600],
  };

  // iOS: TDFormTextView - height 230, radius 8, border neutral300, neutral50 bg
  const textareaContainerStyle: React.CSSProperties = {
    backgroundColor: colors.neutral[50],
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 8,
    padding: '14px 12px',
    height: 230,
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    resize: 'none',
    fontSize: typography.regularBody4.fontSize,
    fontWeight: typography.regularBody4.fontWeight,
    lineHeight: 1.6,
    color: colors.neutral[800],
    outline: 'none',
    fontFamily: 'inherit',
  };

  // iOS: TDFormPhotoView - add button 88px height, radius 12, thumbnails 88x88
  const photoContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  };

  const photoAddButtonStyle: React.CSSProperties = {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: colors.baseWhite,
    border: `1px solid ${colors.neutral[300]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  };

  const photoPreviewContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: 88,
    height: 88,
    flexShrink: 0,
  };

  const photoPreviewStyle: React.CSSProperties = {
    width: 88,
    height: 88,
    borderRadius: 8,
    border: `1px solid ${colors.neutral[300]}`,
    objectFit: 'cover',
  };

  const photoRemoveButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[800],
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  // iOS: Photo caption - regularCaption1 font (smaller than mediumBody2)
  const photoCaptionStyle: React.CSSProperties = {
    marginTop: 12,
    fontSize: typography.regularCaption1.fontSize,
    fontWeight: typography.regularCaption1.fontWeight,
    color: colors.neutral[500],
  };

  // iOS: Button container - height 112, spacing 10
  const footerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '16px',
    paddingBottom: 32,
    backgroundColor: colors.baseWhite,
    display: 'flex',
    gap: 10,
  };

  // iOS: Save button - primary500 bg, white text, radius 12, height 56
  const saveButtonStyle: React.CSSProperties = {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: emotion ? colors.primary[500] : colors.neutral[300],
    border: 'none',
    fontSize: typography.boldHeader3.fontSize,
    fontWeight: typography.boldHeader3.fontWeight,
    color: colors.baseWhite,
    cursor: emotion ? 'pointer' : 'not-allowed',
  };

  // iOS: Delete button - white bg, error text, error border, radius 12, height 56
  const deleteButtonStyle: React.CSSProperties = {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.baseWhite,
    border: `1px solid ${colors.semantic.error}`,
    fontSize: typography.boldHeader3.fontSize,
    fontWeight: typography.boldHeader3.fontWeight,
    color: colors.semantic.error,
    cursor: 'pointer',
  };

  // iOS: Snackbar - neutral700 bg, radius 8, height 42
  const snackbarStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 130,
    left: 16,
    right: 16,
    height: 42,
    backgroundColor: colors.neutral[700],
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: showSnackbar ? 1 : 0,
    transform: showSnackbar ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle}>
      {/* Header - iOS: Empty navigation bar, only back button */}
      <div style={headerStyle}>
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
        <div style={{ flex: 1 }} />
      </div>

      {/* Scrollable Content */}
      <div ref={scrollRef} style={contentStyle}>
        <div style={stackStyle}>
          {/* Emotion Section - iOS: TDRequiredTitle with "감정 선택" */}
          <div>
            <div style={sectionHeaderStyle}>
              <div style={sectionTitleContainerStyle}>
                <TDLabel text="감정 선택" font="boldHeader5" color={colors.neutral[800]} />
                <span style={{
                  fontSize: typography.boldBody1.fontSize,
                  fontWeight: typography.boldBody1.fontWeight,
                  color: colors.primary[500],
                  marginLeft: 4,
                }}>*</span>
              </div>
              <TDLabel text="* 필수 항목" font="mediumBody3" color={colors.neutral[500]} />
            </div>
            <div style={emotionScrollStyle}>
              {emotions.map((item) => {
                const isSelected = emotion === item.emotion;
                const hasSelection = emotion !== null;
                return (
                  <button
                    key={item.emotion}
                    onClick={() => setEmotion(item.emotion)}
                    style={getEmotionCellStyle(isSelected, hasSelection)}
                  >
                    <img
                      src={item.image}
                      alt={item.label}
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: 'contain',
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: colors.neutral[200], margin: '-16px 0' }} />

          {/* Title Section - iOS: character count on the right of header */}
          <div style={formFieldContainerStyle}>
            <div style={sectionHeaderStyle}>
              <TDLabel text="제목" font="boldHeader5" color={colors.neutral[800]} />
              <div style={headerCountStyle}>
                <span style={{ color: colors.neutral[800] }}>{title.length}</span>
                <span style={{ color: colors.neutral[500] }}> / {MAX_TITLE_CHARS}</span>
              </div>
            </div>
            <div style={inputContainerStyle}>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="미작성 시 선택 감정에 따라 자동 입력돼요"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Keywords Section */}
          <div>
            <div style={sectionHeaderStyle}>
              <div style={sectionTitleContainerStyle}>
                <img src={tomatoSmall} alt="" style={sectionIconStyle} />
                <TDLabel text="오늘의 키워드" font="boldBody2" color={colors.neutral[600]} />
              </div>
              {keywords.length > 0 && !isDeleteMode && (
                <button style={deleteModeBtnStyle} onClick={() => setIsDeleteMode(true)}>
                  삭제
                </button>
              )}
              {isDeleteMode && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={deleteModeBtnStyle} onClick={() => {
                    setIsDeleteMode(false);
                    setKeywordsToDelete(new Set());
                  }}>
                    취소
                  </button>
                  <button
                    style={{ ...deleteModeBtnStyle, color: colors.semantic.error }}
                    onClick={handleDeleteKeywords}
                    disabled={keywordsToDelete.size === 0}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
            {isDeleteMode && keywordsToDelete.size > 0 && (
              <div style={{ marginBottom: 12 }}>
                <TDLabel
                  text="· 삭제 할 키워드를 선택해주세요"
                  font="mediumBody2"
                  color={colors.semantic.error}
                />
              </div>
            )}
            {/* iOS: Add button is left-aligned (not full width), + icon at end of text */}
            {!isDeleteMode && (
              <button
                style={addKeywordButtonStyle}
                onClick={() => setShowKeywordSheet(true)}
              >
                키워드 추가 +
              </button>
            )}
            {/* iOS: Tags displayed below the add button */}
            {keywords.length > 0 && (
              <div style={{ ...keywordTagContainerStyle, marginTop: 12 }}>
                {keywords.map((keyword) => (
                  <span
                    key={keyword.id}
                    style={getKeywordTagStyle(keywordsToDelete.has(keyword.id))}
                    onClick={() => handleKeywordClick(keyword)}
                  >
                    {keyword.content}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Memo Section - iOS: character count on the right of header */}
          <div style={formFieldContainerStyle}>
            <div style={sectionHeaderStyle}>
              <div style={sectionTitleContainerStyle}>
                <img src={penNeutral} alt="" style={sectionIconStyle} />
                <TDLabel text="문장 기록" font="boldBody2" color={colors.neutral[600]} />
              </div>
              <div style={headerCountStyle}>
                <span style={{ color: colors.neutral[800] }}>{memo.length}</span>
                <span style={{ color: colors.neutral[500] }}> / {MAX_MEMO_CHARS}</span>
              </div>
            </div>
            <div style={textareaContainerStyle}>
              <textarea
                value={memo}
                onChange={handleMemoChange}
                placeholder="자유롭게 내용을 작성해 주세요."
                style={textareaStyle}
              />
            </div>
          </div>

          {/* Photo Section - iOS: photo count on the right of header */}
          <div>
            <div style={sectionHeaderStyle}>
              <div style={sectionTitleContainerStyle}>
                <img src={photoIcon} alt="" style={sectionIconStyle} />
                <TDLabel text="사진 기록" font="boldBody2" color={colors.neutral[600]} />
              </div>
              <div style={headerCountStyle}>
                <span style={{ color: colors.neutral[800] }}>{imagePreviews.length}</span>
                <span style={{ color: colors.neutral[500] }}> / {MAX_PHOTOS}</span>
              </div>
            </div>
            <div style={photoContainerStyle}>
              {imagePreviews.length < MAX_PHOTOS && (
                <button style={photoAddButtonStyle} onClick={() => fileInputRef.current?.click()}>
                  <Plus size={24} color={colors.neutral[600]} />
                </button>
              )}
              {imagePreviews.map((preview, index) => (
                <div key={index} style={photoPreviewContainerStyle}>
                  <img src={preview} alt={`Preview ${index}`} style={photoPreviewStyle} />
                  <button style={photoRemoveButtonStyle} onClick={() => handleRemoveImage(index)}>
                    <X size={14} color={colors.baseWhite} />
                  </button>
                </div>
              ))}
            </div>
            <p style={photoCaptionStyle}>
              사진은 10MB 이하의 PNG, GIF, JPG 파일만 등록할 수 있습니다.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/gif,image/jpeg"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* iOS: Description section - 2 lines of tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <TDLabel
              text="· 나의 하루를 되돌아보며 오늘의 실수와 감정을 정리해봐요"
              font="mediumBody2"
              color={colors.neutral[500]}
            />
            <TDLabel
              text="· 더 나은 내일을 위한 기록 습관들이기"
              font="mediumBody2"
              color={colors.neutral[500]}
            />
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={footerStyle}>
        {isEditMode && onDelete && (
          <button style={deleteButtonStyle} onClick={handleDelete}>
            삭제
          </button>
        )}
        <button
          style={saveButtonStyle}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>

      {/* Snackbar */}
      <div style={snackbarStyle}>
        <TDLabel text="감정선택은 필수 입력이에요!" font="mediumBody3" color={colors.baseWhite} />
      </div>

      {/* Keyword Sheet */}
      <KeywordSheet
        isOpen={showKeywordSheet}
        onClose={() => setShowKeywordSheet(false)}
        selectedKeywords={keywords}
        onSelect={handleKeywordSelect}
      />
    </div>
  );
};
