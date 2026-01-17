import React, { useState, useEffect, useRef } from "react";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/typography";
import { ChevronLeft, X, Plus } from "lucide-react";
import warningIcon from "../../assets/icons/caution/warningMedium.png";
import { Post, PostCategory } from "../../types";

interface SocialWriteViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    postId?: number; // If provided, it's an update; otherwise, create
    title?: string;
    content: string;
    socialCategoryIds: number[];
    images?: File[];
    existingImageUrls?: string[]; // Existing image URLs to keep (for edit mode)
  }) => void;
  isSubmitting?: boolean;
  editPost?: Post; // Post to edit (if provided, enters edit mode)
}

// PostCategory to category ID mapping (matching iOS PostCategory rawValue)
const postCategoryToId = (category: PostCategory): number => {
  switch (category) {
    case "concentration": return 1;
    case "memory": return 2;
    case "mistake": return 3;
    case "anxiety": return 4;
    case "information": return 5;
    case "normal": return 6;
    default: return 6;
  }
};

// iOS PostCategory titles and IDs (matching TDDomain/Entity/Enum/PostCategory.swift)
// The API expects socialCategoryIds as integers (1-6)
const categoryOptions: { id: number; label: string }[] = [
  { id: 1, label: "집중력" }, // concentration
  { id: 2, label: "기억력" }, // memory
  { id: 3, label: "실수" }, // mistake
  { id: 4, label: "불안" }, // anxiety
  { id: 5, label: "정보" }, // information
  { id: 6, label: "기타" }, // normal
];

// Max limits
const MAX_TITLE_LENGTH = 16;
const MAX_CONTENT_LENGTH = 500;
const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Warning caution view component (iOS SocialCautionView - warning style only)
const WarningCautionView: React.FC<{
  title: string;
  items: string[];
}> = ({ title, items }) => {
  return (
    <div
      style={{
        backgroundColor: colors.neutral[50],
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginBottom: 4,
        }}
      >
        <img
          src={warningIcon}
          alt=""
          style={{
            width: 24,
            height: 24,
            filter: "grayscale(100%) brightness(1.5)",
          }}
        />
        <span
          style={{
            fontSize: typography.boldBody2.fontSize,
            fontWeight: typography.boldBody2.fontWeight,
            color: colors.neutral[600],
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          paddingLeft: 4,
        }}
      >
        {items.map((item, index) => (
          <span
            key={index}
            style={{
              fontSize: typography.mediumCaption1.fontSize,
              color: colors.neutral[700],
              lineHeight: 1.5,
            }}
          >
            ㆍ {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export const SocialWriteView: React.FC<SocialWriteViewProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  editPost,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // For edit mode
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Check if in edit mode
  const isEditMode = !!editPost;

  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animation effect (same as SocialDetailView)
  useEffect(() => {
    if (isOpen) {
      // First ensure the component is rendered
      setShouldRender(true);
      // Reset animation state before starting
      setIsAnimating(false);

      // Initialize form state for edit mode (iOS SocialCreatorViewController.editPost)
      if (editPost) {
        setTitle(editPost.titleText || "");
        setContent(editPost.contentText || "");
        // Convert PostCategory[] to category IDs
        const categoryIds = editPost.categories.map(postCategoryToId);
        setSelectedCategories(categoryIds);
        // Set existing image URLs (will be displayed separately from new photos)
        setExistingImageUrls(editPost.imageList || []);
        // Reset new photos
        setPhotos([]);
        setPhotoPreviews([]);
      }

      // Use setTimeout to ensure the initial state (translateX(100%)) is rendered
      // before we trigger the animation to translateX(0)
      const animationTimer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      return () => clearTimeout(animationTimer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        // Reset form
        setTitle("");
        setContent("");
        setSelectedCategories([]);
        setPhotos([]);
        setPhotoPreviews([]);
        setExistingImageUrls([]);
        setSnackbarMessage("");
        setShowSnackbar(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, editPost]);

  // Clean up photo previews on unmount
  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  if (!shouldRender) return null;

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CONTENT_LENGTH) {
      setContent(value);
    }
  };

  // Total image count (existing + new)
  const totalImageCount = existingImageUrls.length + photos.length;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      // Check file type
      const validTypes = ["image/png", "image/gif", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        showSnackbarMessage("PNG, GIF, JPG 파일만 등록할 수 있습니다.");
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        showSnackbarMessage("사진은 10MB 이하만 등록할 수 있습니다.");
        return;
      }

      // Check total count (including existing images)
      if (totalImageCount + validFiles.length >= MAX_PHOTOS) {
        showSnackbarMessage(
          `사진은 최대 ${MAX_PHOTOS}장까지 등록할 수 있습니다.`,
        );
        return;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setPhotos((prev) => [...prev, ...validFiles]);
      setPhotoPreviews((prev) => [...prev, ...validPreviews]);
    }

    // Reset input
    e.target.value = "";
  };

  // Remove new photo
  const handlePhotoRemove = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing image (for edit mode)
  const handleExistingImageRemove = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const showSnackbarMessage = (message: string) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  const isFormValid =
    selectedCategories.length > 0 && content.trim().length > 0;

  const handleSubmit = () => {
    // Validation
    if (selectedCategories.length === 0) {
      showSnackbarMessage("카테고리를 선택해 주세요.");
      return;
    }

    if (!content.trim()) {
      showSnackbarMessage("내용을 입력해 주세요.");
      return;
    }

    if (selectedCategories.length === 0 || !content.trim()) {
      showSnackbarMessage("카테고리와 내용은 필수 입력이에요!");
      return;
    }

    onSubmit({
      postId: editPost?.id, // Include postId for edit mode
      title: title.trim() || undefined,
      content: content.trim(),
      socialCategoryIds: selectedCategories,
      images: photos.length > 0 ? photos : undefined,
      existingImageUrls: isEditMode ? existingImageUrls : undefined,
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.baseWhite,
        display: "flex",
        flexDirection: "column",
        transform: isAnimating ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      {/* Navigation Bar - iOS style: only back button, no title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 44,
          backgroundColor: colors.baseWhite,
          borderBottom: `1px solid ${colors.neutral[100]}`,
          paddingLeft: 4,
        }}
      >
        {/* Back button */}
        <button
          onClick={onClose}
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={24} color={colors.neutral[800]} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
        }}
      >
        {/* Category Section */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: typography.boldBody2.fontSize,
                fontWeight: typography.boldBody2.fontWeight,
                color: colors.neutral[800],
              }}
            >
              카테고리
            </span>
            <span
              style={{
                fontSize: typography.boldCaption1.fontSize,
                color: colors.semantic.error,
                marginLeft: 4,
              }}
            >
              *
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              flexWrap: "nowrap",
            }}
          >
            {categoryOptions.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryToggle(cat.id)}
                  style={{
                    padding: "0 14px",
                    height: 33,
                    borderRadius: 8,
                    backgroundColor: isSelected
                      ? colors.primary[500]
                      : colors.baseWhite,
                    color: isSelected ? colors.baseWhite : colors.neutral[700],
                    border: isSelected
                      ? "1px solid transparent"
                      : `1px solid ${colors.neutral[200]}`,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Title Section */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: typography.boldBody2.fontSize,
                fontWeight: typography.boldBody2.fontWeight,
                color: colors.neutral[800],
              }}
            >
              제목
            </span>
            <span
              style={{
                fontSize: typography.regularCaption1.fontSize,
                color: colors.neutral[500],
              }}
            >
              {title.length}/{MAX_TITLE_LENGTH}
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="글의 제목을 작성해주세요."
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: colors.neutral[50],
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: 12,
              fontSize: typography.mediumBody2.fontSize,
              color: colors.neutral[800],
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Content Section */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  fontSize: typography.boldBody2.fontSize,
                  fontWeight: typography.boldBody2.fontWeight,
                  color: colors.neutral[800],
                }}
              >
                내용
              </span>
              <span
                style={{
                  fontSize: typography.boldCaption1.fontSize,
                  color: colors.semantic.error,
                  marginLeft: 4,
                }}
              >
                *
              </span>
            </div>
            <span
              style={{
                fontSize: typography.regularCaption1.fontSize,
                color: colors.neutral[500],
              }}
            >
              {content.length}/{MAX_CONTENT_LENGTH}
            </span>
          </div>
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="자유롭게 내용을 작성해 주세요."
            style={{
              width: "100%",
              minHeight: 160,
              padding: "12px 16px",
              backgroundColor: colors.neutral[50],
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: 12,
              fontSize: typography.mediumBody2.fontSize,
              color: colors.neutral[800],
              outline: "none",
              resize: "vertical",
              lineHeight: 1.6,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Photo Section */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: typography.boldBody2.fontSize,
                fontWeight: typography.boldBody2.fontWeight,
                color: colors.neutral[800],
              }}
            >
              사진 첨부
            </span>
            <span
              style={{
                fontSize: typography.regularCaption1.fontSize,
                color: colors.neutral[500],
              }}
            >
              {totalImageCount}/{MAX_PHOTOS}
            </span>
          </div>

          {/* Photo grid */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* Add button */}
            {totalImageCount < MAX_PHOTOS && (
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 8,
                  backgroundColor: colors.neutral[50],
                  border: `1px dashed ${colors.neutral[300]}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Plus size={24} color={colors.neutral[400]} />
              </button>
            )}

            {/* Existing images (for edit mode) */}
            {existingImageUrls.map((url, index) => (
              <div
                key={`existing-${index}`}
                style={{
                  position: "relative",
                  width: 88,
                  height: 88,
                }}
              >
                <img
                  src={url}
                  alt={`기존 사진 ${index + 1}`}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={() => handleExistingImageRemove(index)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <X size={12} color={colors.baseWhite} />
                </button>
              </div>
            ))}

            {/* New photo previews */}
            {photoPreviews.map((preview, index) => (
              <div
                key={`new-${index}`}
                style={{
                  position: "relative",
                  width: 88,
                  height: 88,
                }}
              >
                <img
                  src={preview}
                  alt={`사진 ${index + 1}`}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={() => handlePhotoRemove(index)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <X size={12} color={colors.baseWhite} />
                </button>
              </div>
            ))}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/gif,image/jpeg,image/jpg"
            multiple
            onChange={handlePhotoSelect}
            style={{ display: "none" }}
          />

          {/* Photo help text */}
          <p
            style={{
              fontSize: typography.regularCaption1.fontSize,
              color: colors.neutral[500],
              marginTop: 8,
              marginBottom: 0,
            }}
          >
            사진은 10MB 이하의 PNG, GIF, JPG 파일만 등록할 수 있습니다.
          </p>
        </div>

        {/* Warning Caution View */}
        <WarningCautionView
          title="이런 글은 안돼요!"
          items={[
            "욕설, 비방 등을 포함한 타인에게 불쾌감을 주는 글",
            "광고 또는 홍보성 게시글",
            "실명, 주민등록번호, 주소 등 개인정보가 포함된 글",
            "타인의 저작권을 침해한 글",
          ]}
        />

        {/* Bottom spacing for fixed button */}
        <div style={{ height: 130 }} />
      </div>

      {/* Fixed Bottom Button Container - iOS style */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 112,
          backgroundColor: colors.baseWhite,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          style={{
            width: "100%",
            height: 56,
            borderRadius: 12,
            backgroundColor:
              isFormValid && !isSubmitting
                ? colors.primary[500]
                : colors.neutral[100],
            color:
              isFormValid && !isSubmitting
                ? colors.baseWhite
                : colors.neutral[500],
            border: "none",
            cursor: isFormValid && !isSubmitting ? "pointer" : "default",
            fontSize: typography.boldHeader3.fontSize,
            fontWeight: typography.boldHeader3.fontWeight,
            transition: "background-color 0.2s ease, color 0.2s ease",
          }}
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </button>
      </div>

      {/* Snackbar - positioned above save button */}
      <div
        style={{
          position: "absolute",
          bottom: showSnackbar ? 120 : 70,
          left: 16,
          right: 16,
          backgroundColor: colors.neutral[700],
          borderRadius: 8,
          padding: "12px 16px",
          opacity: showSnackbar ? 1 : 0,
          transition: "all 0.3s ease",
          pointerEvents: showSnackbar ? "auto" : "none",
        }}
      >
        <span
          style={{
            fontSize: typography.mediumBody3.fontSize,
            color: colors.baseWhite,
          }}
        >
          {snackbarMessage}
        </span>
      </div>
    </div>
  );
};
