import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/typography";
import { layout } from "../../styles/layout";
import { Post } from "../../types";
import { TDAvatar } from "../common/TDAvatar";
import { TDLabel } from "../common/TDLabel";
import { SocialRoutineView } from "./SocialRoutineView";
import commentIcon from "../../assets/icons/comment.png";
import likeIcon from "../../assets/icons/like.png";
import likeEmptyIcon from "../../assets/icons/likeEmpty.png";
import dotVerticalIcon from "../../assets/icons/dot/vertical2Small.png";
import penNeutralIcon from "../../assets/icons/pen/penNeutral.png";
import deleteEventIcon from "../../assets/icons/alert/deleteEvent.png";
import { X } from "lucide-react";

interface SocialFeedCardProps {
  post: Post;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onClick?: (postId: number) => void;
  highlightTerm?: string; // iOS: search term highlighting
  currentUserId?: number; // For showing edit/delete options on own posts
  onEdit?: (post: Post) => void;
  onDelete?: (postId: number) => void;
}

// Helper function to highlight search term in text (iOS SocialFeedCollectionViewCell pattern)
const HighlightedText: React.FC<{
  text: string;
  term: string;
  highlightColor: string;
  style: React.CSSProperties;
}> = ({ text, term, highlightColor, style }) => {
  if (!term || !text) {
    return <span style={style}>{text}</span>;
  }

  const regex = new RegExp(
    `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);

  return (
    <span style={style}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} style={{ color: highlightColor }}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  );
};

export const SocialFeedCard: React.FC<SocialFeedCardProps> = ({
  post,
  onLike,
  onComment,
  onClick,
  highlightTerm,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [prevIsLike, setPrevIsLike] = useState(post.isLike);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if this is the current user's post
  const isMyPost =
    currentUserId !== undefined && post.user.id === currentUserId;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (post.isLike && !prevIsLike) {
      setIsLikeAnimating(true);
      const timer = setTimeout(() => setIsLikeAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevIsLike(post.isLike);
  }, [post.isLike, prevIsLike]);
  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
    padding: `${layout.social.cellVerticalPadding}px ${layout.sectionHorizontalInset}px`,
    cursor: onClick ? "pointer" : "default",
    position: "relative",
  };

  const separatorStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: layout.sectionHorizontalInset,
    right: layout.sectionHorizontalInset,
    height: 1,
    backgroundColor: colors.neutral[100],
  };

  const headerRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  };

  const contentContainerStyle: React.CSSProperties = {
    marginLeft: layout.social.cellContentLeading,
  };

  const userInfoStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  };

  const userRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const timeStyle: React.CSSProperties = {
    fontSize: typography.regularCaption1.fontSize,
    color: colors.neutral[500],
  };

  const textContainerStyle: React.CSSProperties = {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  const imagesContainerStyle: React.CSSProperties = {
    marginTop: 14,
    display: "flex",
    gap: 4,
  };

  // iOS style: all images have same fixed width (1/3 of container)
  const imageStyle: React.CSSProperties = {
    width: "calc((100% - 8px) / 3)",
    aspectRatio: "1 / 1",
    borderRadius: 4,
    objectFit: "cover",
    backgroundColor: colors.neutral[100],
    flexShrink: 0,
  };

  const footerStyle: React.CSSProperties = {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

  const actionButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    marginRight: 10,
  };

  const actionTextStyle: React.CSSProperties = {
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: colors.neutral[500],
  };

  const handleContainerClick = () => {
    if (onClick) onClick(post.id);
  };

  return (
    <div style={containerStyle} onClick={handleContainerClick}>
      {/* Header with avatar and user info */}
      <div style={headerRowStyle}>
        <TDAvatar src={post.user.profileImageUrl} size="small" />

        <div style={userInfoStyle}>
          <div style={userRowStyle}>
            <TDLabel
              text={post.isAnonymous ? "익명" : post.user.nickname}
              font="boldBody2"
              color={colors.neutral[800]}
            />
            {post.user.title && (
              <span
                style={{
                  padding: "2px 6px",
                  backgroundColor: colors.primary[100],
                  borderRadius: 4,
                  fontSize: typography.mediumCaption2.fontSize,
                  color: colors.primary[600],
                }}
              >
                {post.user.title}
              </span>
            )}
          </div>
          <span style={timeStyle}>
            {formatDistanceToNow(new Date(post.timestamp), {
              addSuffix: true,
              locale: ko,
            })}
          </span>
        </div>

        {/* More button - only shown for own posts (iOS SocialHeaderView) */}
        {isMyPost && (
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              style={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <img
                src={dotVerticalIcon}
                alt="더보기"
                style={{ width: 16, height: 16 }}
              />
            </button>

            {/* Dropdown Menu (iOS TDDropdownHoverView) */}
            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: 28,
                  right: 0,
                  width: 100,
                  backgroundColor: colors.baseWhite,
                  borderRadius: 8,
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                  zIndex: 100,
                  paddingLeft: 6,
                  paddingRight: 6,
                }}
              >
                {/* Edit option */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    onEdit?.(post);
                  }}
                  style={{
                    width: "100%",
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 12px",
                    backgroundColor: colors.baseWhite,
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "8px 8px 0 0",
                    justifyContent: "space-between",
                  }}
                >
                  <img
                    src={penNeutralIcon}
                    alt=""
                    style={{ width: 16, height: 16 }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: colors.neutral[800],
                    }}
                  >
                    수정
                  </span>
                </button>

                {/* Delete option */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    setShowDeleteModal(true);
                  }}
                  style={{
                    width: "100%",
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 12px",
                    backgroundColor: colors.baseWhite,
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "0 0 8px 8px",
                    justifyContent: "space-between",
                  }}
                >
                  <X size={16} color={colors.semantic.error} />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: colors.semantic.error,
                    }}
                  >
                    삭제
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={contentContainerStyle}>
        <div style={textContainerStyle}>
          {post.titleText &&
            (highlightTerm ? (
              <HighlightedText
                text={post.titleText}
                term={highlightTerm}
                highlightColor={colors.primary[400]} // iOS: title highlighted in primary blue
                style={{
                  fontSize: typography.boldHeader5.fontSize,
                  fontWeight: typography.boldHeader5.fontWeight,
                  lineHeight: typography.boldHeader5.lineHeight,
                  color: colors.neutral[800],
                  display: "block",
                }}
              />
            ) : (
              <TDLabel
                text={post.titleText}
                font="boldHeader5"
                color={colors.neutral[800]}
              />
            ))}
          {highlightTerm ? (
            <HighlightedText
              text={post.contentText}
              term={highlightTerm}
              highlightColor="#F97316" // iOS: content highlighted in orange
              style={{
                fontSize: typography.regularBody4.fontSize,
                fontWeight: typography.regularBody4.fontWeight,
                lineHeight: typography.regularBody4.lineHeight,
                letterSpacing: typography.regularBody4.letterSpacing,
                color: colors.neutral[800],
                margin: 0,
                whiteSpace: "pre-wrap",
                display: "block",
              }}
            />
          ) : (
            <p
              style={{
                fontSize: typography.regularBody4.fontSize,
                fontWeight: typography.regularBody4.fontWeight,
                lineHeight: typography.regularBody4.lineHeight,
                letterSpacing: typography.regularBody4.letterSpacing,
                color: colors.neutral[800],
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {post.contentText}
            </p>
          )}
        </div>

        {/* Routine Card (if exists) */}
        {post.routine && (
          <div style={{ marginTop: 14 }}>
            <SocialRoutineView routine={post.routine} />
          </div>
        )}

        {/* Images - max 3 like iOS, all same size */}
        {post.imageList && post.imageList.length > 0 && (
          <div style={imagesContainerStyle}>
            {post.imageList.slice(0, 3).map((image, index) => (
              <div key={index} style={{ position: "relative", ...imageStyle }}>
                <img
                  src={image}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 4,
                    objectFit: "cover",
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                {/* Show +N overlay on last image if more than 3 */}
                {index === 2 && post.imageList!.length > 3 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: colors.baseWhite,
                      fontSize: typography.mediumBody2.fontSize,
                      fontWeight: typography.mediumBody2.fontWeight,
                    }}
                  >
                    +{post.imageList!.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer - Comment & Like (iOS compact style order) */}
        <div style={footerStyle}>
          {/* Comment */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComment?.(post.id);
            }}
            style={actionButtonStyle}
          >
            <img
              src={commentIcon}
              alt="댓글"
              style={{ width: 20, height: 20 }}
            />
            <span style={actionTextStyle}>{post.commentCount || 0}</span>
          </button>

          {/* Like */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike?.(post.id);
            }}
            style={actionButtonStyle}
          >
            <span
              className={isLikeAnimating ? "like-pulse" : ""}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={post.isLike ? likeIcon : likeEmptyIcon}
                alt="좋아요"
                style={{
                  width: 20,
                  height: 20,
                }}
              />
            </span>
            <span
              style={{
                ...actionTextStyle,
                color: post.isLike ? colors.primary[400] : colors.neutral[500],
              }}
            >
              {post.likeCount}
            </span>
          </button>
        </div>
      </div>

      {/* Separator with margins */}
      <div style={separatorStyle} />

      {/* Delete Confirmation Modal (iOS DeleteEventView) */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(false);
          }}
        >
          <div
            style={{
              width: 340,
              backgroundColor: colors.baseWhite,
              borderRadius: 16,
              padding: "32px 24px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Delete event image */}
            <img
              src={deleteEventIcon}
              alt=""
              style={{ width: 80, height: 80, marginBottom: 16 }}
            />

            {/* Title */}
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: colors.neutral[800],
                marginBottom: 8,
              }}
            >
              앗 !! 정말 삭제하시겠어요?
            </span>

            {/* Description */}
            <span
              style={{
                fontSize: 14,
                color: colors.neutral[500],
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              삭제한 글은 다시 복구할 수 없어요
            </span>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(false);
                onDelete?.(post.id);
              }}
              style={{
                width: "100%",
                height: 48,
                backgroundColor: colors.semantic.error,
                color: colors.baseWhite,
                border: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 8,
              }}
            >
              삭제
            </button>

            {/* Cancel button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(false);
              }}
              style={{
                width: "100%",
                height: 48,
                backgroundColor: colors.baseWhite,
                color: colors.neutral[600],
                border: `1px solid ${colors.neutral[200]}`,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes like-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .like-pulse {
          animation: like-pulse 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};
