import React, { useState, useRef } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TDLabel } from '../common/TDLabel';
import { TDButton } from '../common/TDButton';
import { Emotion } from '../../types';
import { Plus, X } from 'lucide-react';

// Assets
import diaryThumbnail from '../../assets/images/diary/content/diaryThumbnail.png';
import penIcon from '../../assets/images/diary/content/pen.png';
import photoIcon from '../../assets/images/diary/content/photo.png';

interface DiaryContentStepProps {
  emotion: Emotion;
  title: string;
  memo: string;
  images: File[];
  imageUrls: string[];
  onSave: (title: string, memo: string, images: File[], imageUrls: string[]) => void;
  onSkip: () => void;
  isSaving: boolean;
}

const MAX_CHARS = 2000;
const MAX_PHOTOS = 2;

export const DiaryContentStep: React.FC<DiaryContentStepProps> = ({
  memo: initialMemo,
  images: initialImages,
  imageUrls: initialImageUrls,
  onSave,
  onSkip,
  isSaving,
}) => {
  const [memo, setMemo] = useState(initialMemo);
  const [images, setImages] = useState<File[]>(initialImages);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialImageUrls);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setMemo(value);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_PHOTOS - images.length;
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

  const handleSave = () => {
    onSave('', memo, images, imagePreviews);
  };

  // ===== STYLES =====

  // iOS: Main container with scroll
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.baseWhite,
  };

  // iOS: Scrollable content area
  const scrollContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '0 16px',
  };

  // iOS: Stack view - top 42pt
  const stackViewStyle: React.CSSProperties = {
    paddingTop: 42,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  // iOS: Title - boldHeader4, centered
  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: 8,
  };

  // iOS: Description - mediumBody2, centered
  const descriptionStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: 0,
  };

  // iOS: Diary thumbnail - 240x240
  const thumbnailContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 0,
  };

  const thumbnailStyle: React.CSSProperties = {
    width: 240,
    height: 240,
    objectFit: 'contain',
  };

  // iOS: Form sections container
  const formSectionsStyle: React.CSSProperties = {
    width: '100%',
  };

  // ===== TDFormTextView - 회고 작성 =====

  // iOS: Form section - height 230pt
  const recordSectionStyle: React.CSSProperties = {
    marginBottom: 14,
  };

  // iOS: Form title row with icon
  const formTitleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  };

  const formTitleLeftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  // iOS: Icon 18x18
  const formIconStyle: React.CSSProperties = {
    width: 18,
    height: 18,
  };

  // iOS: Counter at top right
  const counterStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  const currentCountStyle: React.CSSProperties = {
    fontSize: typography.regularBody2.fontSize,
    color: colors.neutral[800],
  };

  const maxCountStyle: React.CSSProperties = {
    fontSize: typography.regularBody2.fontSize,
    color: colors.neutral[600],
    marginLeft: 4,
  };

  // iOS: Textarea - height 196pt, cornerRadius 8, neutral50 bg, neutral300 border
  const textareaStyle: React.CSSProperties = {
    width: '100%',
    height: 196,
    padding: '14px 12px',
    backgroundColor: colors.neutral[50],
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 8,
    fontSize: typography.regularBody4?.fontSize || 14,
    lineHeight: 1.6,
    color: colors.neutral[800],
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  // ===== TDFormPhotoView - 사진 기록 =====

  const photoSectionStyle: React.CSSProperties = {
    marginBottom: 16,
  };

  // iOS: Photo row with add button and previews
  const photoRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  };

  // iOS: Add photo button - 88x88, cornerRadius 12, white bg, neutral300 solid border
  const addPhotoButtonStyle: React.CSSProperties = {
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

  // iOS: Photo previews scroll container
  const photoPreviewsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    flex: 1,
  };

  // iOS: Photo preview container - 88x88
  const photoPreviewContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: 88,
    height: 88,
    flexShrink: 0,
  };

  // iOS: Photo preview image - 88x88, cornerRadius 8
  const photoPreviewStyle: React.CSSProperties = {
    width: 88,
    height: 88,
    borderRadius: 8,
    objectFit: 'cover',
    border: `1px solid ${colors.neutral[300]}`,
  };

  // iOS: Remove button
  const removeButtonStyle: React.CSSProperties = {
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

  // iOS: Caption - regularCaption1, neutral500
  const captionStyle: React.CSSProperties = {
    fontSize: typography.regularCaption1.fontSize,
    color: colors.neutral[500],
  };

  // iOS: Button stack - bottom 28pt, height 56pt, spacing 10pt
  const footerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 10,
    padding: '16px 16px 28px',
    backgroundColor: colors.baseWhite,
  };

  return (
    <div style={containerStyle}>
      {/* Scrollable Content */}
      <div style={scrollContainerStyle}>
        <div style={stackViewStyle}>
          {/* Header - iOS: centered */}
          <div style={titleStyle}>
            <TDLabel
              text="오늘을 돌아보고, 내일을 준비해요"
              font="boldHeader4"
              color={colors.neutral[800]}
            />
          </div>
          <div style={descriptionStyle}>
            <TDLabel
              text="한 줄도 괜찮아요! 편하게 작성해봐요"
              font="mediumBody2"
              color={colors.neutral[600]}
            />
          </div>

          {/* iOS: Diary Thumbnail - 240x240 (fixed image, not emotion-based) */}
          <div style={thumbnailContainerStyle}>
            <img src={diaryThumbnail} alt="Diary" style={thumbnailStyle} />
          </div>

          {/* Form Sections */}
          <div style={formSectionsStyle}>
            {/* TDFormTextView - 회고 작성 */}
            <div style={recordSectionStyle}>
              <div style={formTitleRowStyle}>
                <div style={formTitleLeftStyle}>
                  <img src={penIcon} alt="" style={formIconStyle} />
                  <TDLabel
                    text="회고 작성"
                    font="boldBody2"
                    color={colors.neutral[600]}
                  />
                </div>
                <div style={counterStyle}>
                  <span style={currentCountStyle}>{memo.length}</span>
                  <span style={maxCountStyle}>/ {MAX_CHARS}</span>
                </div>
              </div>
              <textarea
                value={memo}
                onChange={handleMemoChange}
                placeholder="자유롭게 내용을 작성해 주세요."
                style={textareaStyle}
              />
            </div>

            {/* TDFormPhotoView - 사진 기록 */}
            <div style={photoSectionStyle}>
              <div style={formTitleRowStyle}>
                <div style={formTitleLeftStyle}>
                  <img src={photoIcon} alt="" style={formIconStyle} />
                  <TDLabel
                    text="사진 기록"
                    font="boldBody2"
                    color={colors.neutral[600]}
                  />
                </div>
                <div style={counterStyle}>
                  <span style={currentCountStyle}>{images.length}</span>
                  <span style={maxCountStyle}>/ {MAX_PHOTOS}</span>
                </div>
              </div>

              <div style={photoRowStyle}>
                {/* Add Photo Button */}
                {images.length < MAX_PHOTOS && (
                  <button
                    style={addPhotoButtonStyle}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus size={24} color={colors.neutral[600]} />
                  </button>
                )}

                {/* Photo Previews */}
                <div style={photoPreviewsContainerStyle}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={photoPreviewContainerStyle}>
                      <img src={preview} alt={`Preview ${index}`} style={photoPreviewStyle} />
                      <button style={removeButtonStyle} onClick={() => handleRemoveImage(index)}>
                        <X size={14} color={colors.baseWhite} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div style={captionStyle}>
                사진은 10MB 이하의 PNG, GIF, JPG 파일만 등록할 수 있습니다.
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer - iOS: bottom 28pt, height 56pt, spacing 10pt */}
      <div style={footerStyle}>
        <TDButton
          title="건너뛰기"
          variant="outline"
          onClick={onSkip}
          disabled={isSaving}
          style={{ flex: 1, height: 56 }}
        />
        <TDButton
          title={isSaving ? '저장 중...' : '저장'}
          onClick={handleSave}
          disabled={isSaving}
          style={{ flex: 2, height: 56 }}
        />
      </div>
    </div>
  );
};
