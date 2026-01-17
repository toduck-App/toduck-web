import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/typography";
import { Post, Comment } from "../../types";
import { TDAvatar } from "../common/TDAvatar";
import { SocialRoutineView } from "./SocialRoutineView";
import { ChevronLeft, X, MoreVertical, Image } from "lucide-react";
import commentIcon from "../../assets/icons/comment.png";
import likeIcon from "../../assets/icons/like.png";
import likeEmptyIcon from "../../assets/icons/likeEmpty.png";

interface SocialDetailViewProps {
  isOpen: boolean;
  post: Post | null;
  comments: Comment[];
  currentUserId?: number;
  isSubmitting?: boolean;
  onClose: () => void;
  onLike: (postId: number) => void;
  onCommentLike: (commentId: number) => void;
  onCommentSubmit: (
    postId: number,
    content: string,
    parentId?: number,
    imageFile?: File,
  ) => void;
  onDeletePost?: (postId: number) => void;
  onEditPost?: (postId: number) => void;
  onReportPost?: (postId: number) => void;
  onBlockUser?: (userId: number) => void;
  onDeleteComment?: (commentId: number) => void;
  onReportComment?: (commentId: number) => void;
}

// iOS SocialFooterView - Compact style for comments
const CompactFooter: React.FC<{
  commentCount?: number;
  likeCount: number;
  isLike: boolean;
  onLike: () => void;
  onComment?: () => void;
  showCommentButton?: boolean;
}> = ({
  commentCount,
  likeCount,
  isLike,
  onLike,
  onComment,
  showCommentButton = true,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", height: 24, gap: 2 }}>
      {/* Comment */}
      {showCommentButton && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComment?.();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <img
              src={commentIcon}
              alt=""
              style={{ width: 20, height: 20, opacity: 0.6 }}
            />
          </button>
          <span
            style={{
              fontSize: typography.regularCaption1.fontSize,
              color: colors.neutral[500],
              marginRight: 10,
            }}
          >
            {commentCount ?? 0}
          </span>
        </>
      )}

      {/* Like */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLike();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <img
          src={isLike ? likeIcon : likeEmptyIcon}
          alt=""
          style={{ width: 20, height: 20 }}
        />
      </button>
      <span
        style={{
          fontSize: typography.regularCaption1.fontSize,
          color: isLike ? colors.primary[400] : colors.neutral[500],
        }}
      >
        {likeCount}
      </span>
    </div>
  );
};

// iOS SocialHeaderView for comments
const CommentHeader: React.FC<{
  nickname: string;
  date: string;
  isMyComment: boolean;
  onMore: () => void;
}> = ({ nickname, date, isMyComment, onMore }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 24,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: typography.mediumBody2.fontSize,
            fontWeight: typography.mediumBody2.fontWeight,
            color: colors.neutral[700],
            lineHeight: "21px",
          }}
        >
          {nickname}
        </span>
        <span
          style={{
            fontSize: typography.regularCaption1.fontSize,
            color: colors.neutral[500],
            lineHeight: "12px",
            marginTop: 2,
          }}
        >
          {date}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMore();
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
        <MoreVertical size={18} color={colors.neutral[400]} />
      </button>
    </div>
  );
};

// iOS SocialDetailCommentCell
const CommentCell: React.FC<{
  comment: Comment;
  currentUserId?: number;
  onLike: (commentId: number) => void;
  onReply: (comment: Comment) => void;
  onDelete?: (commentId: number) => void;
  onReport?: (commentId: number) => void;
  onBlockUser?: (userId: number) => void;
}> = ({
  comment,
  currentUserId,
  onLike,
  onReply,
  onDelete,
  onReport,
  onBlockUser,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isMyComment = currentUserId === comment.user.id;

  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const menuItems = isMyComment
    ? [{ label: "삭제", action: () => onDelete?.(comment.id), danger: true }]
    : [
        {
          label: "차단",
          action: () => onBlockUser?.(comment.user.id),
          danger: true,
        },
      ];

  return (
    <div
      style={{
        backgroundColor: colors.baseWhite,
        borderRadius: 12,
        margin: "0 10px 8px",
        padding: 16,
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        {/* Avatar */}
        <TDAvatar src={comment.user.profileImageUrl} size="small" />

        {/* Content Stack */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Header */}
          <div style={{ position: "relative" }}>
            <CommentHeader
              nickname={comment.user.nickname}
              date={formattedDate}
              isMyComment={isMyComment}
              onMore={() => setShowMenu(!showMenu)}
            />
            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 100,
                  }}
                  onClick={() => setShowMenu(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 28,
                    right: 0,
                    width: 110,
                    backgroundColor: colors.baseWhite,
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 101,
                    overflow: "hidden",
                  }}
                >
                  {menuItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setShowMenu(false);
                        item.action();
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        textAlign: "left",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        color: item.danger
                          ? colors.semantic.error
                          : colors.neutral[800],
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <p
            style={{
              fontSize: typography.regularBody4.fontSize,
              lineHeight: 1.5,
              color: colors.neutral[800],
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {comment.content}
          </p>

          {/* Image */}
          {comment.imageUrl && (
            <img
              src={comment.imageUrl}
              alt=""
              style={{
                width: 120,
                height: 120,
                borderRadius: 4,
                objectFit: "cover",
              }}
            />
          )}

          {/* Footer */}
          <CompactFooter
            commentCount={comment.replies?.length}
            likeCount={comment.likeCount}
            isLike={comment.isLike}
            onLike={() => onLike(comment.id)}
            onComment={() => onReply(comment)}
            showCommentButton={true}
          />

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {comment.replies.map((reply) => (
                <ReplyCell
                  key={reply.id}
                  reply={reply}
                  currentUserId={currentUserId}
                  onLike={onLike}
                  onDelete={onDelete}
                  onReport={onReport}
                  onBlockUser={onBlockUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reply Cell (대댓글)
const ReplyCell: React.FC<{
  reply: Comment;
  currentUserId?: number;
  onLike: (commentId: number) => void;
  onDelete?: (commentId: number) => void;
  onReport?: (commentId: number) => void;
  onBlockUser?: (userId: number) => void;
}> = ({ reply, currentUserId, onLike, onDelete, onReport, onBlockUser }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isMyComment = currentUserId === reply.user.id;

  const formattedDate = formatDistanceToNow(new Date(reply.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const menuItems = isMyComment
    ? [{ label: "삭제", action: () => onDelete?.(reply.id), danger: true }]
    : [
        {
          label: "차단",
          action: () => onBlockUser?.(reply.user.id),
          danger: true,
        },
      ];

  return (
    <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
      <TDAvatar src={reply.user.profileImageUrl} size="small" />
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}
      >
        {/* Header */}
        <div style={{ position: "relative" }}>
          <CommentHeader
            nickname={reply.user.nickname}
            date={formattedDate}
            isMyComment={isMyComment}
            onMore={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <>
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 100,
                }}
                onClick={() => setShowMenu(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: 28,
                  right: 0,
                  width: 110,
                  backgroundColor: colors.baseWhite,
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 101,
                  overflow: "hidden",
                }}
              >
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowMenu(false);
                      item.action();
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      textAlign: "left",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 14,
                      color: item.danger
                        ? colors.semantic.error
                        : colors.neutral[800],
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <p
          style={{
            fontSize: typography.regularBody4.fontSize,
            lineHeight: 1.5,
            color: colors.neutral[800],
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {reply.content}
        </p>

        {/* Image */}
        {reply.imageUrl && (
          <img
            src={reply.imageUrl}
            alt=""
            style={{
              width: 120,
              height: 120,
              borderRadius: 4,
              objectFit: "cover",
            }}
          />
        )}

        {/* Footer - no comment button for replies */}
        <CompactFooter
          likeCount={reply.likeCount}
          isLike={reply.isLike}
          onLike={() => onLike(reply.id)}
          showCommentButton={false}
        />
      </div>
    </div>
  );
};

export const SocialDetailView: React.FC<SocialDetailViewProps> = ({
  isOpen,
  post,
  comments,
  currentUserId,
  isSubmitting,
  onClose,
  onLike,
  onCommentLike,
  onCommentSubmit,
  onDeletePost,
  onEditPost,
  onReportPost,
  onBlockUser,
  onDeleteComment,
  onReportComment,
}) => {
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setReplyTarget(null);
        setCommentText("");
        setSelectedImage(null);
        setImagePreview(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-resize textarea (max 3 lines)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const lineHeight = 20;
      const maxHeight = lineHeight * 3 + 16;
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [commentText]);

  if (!shouldRender || !post) return null;

  const handleSubmitComment = () => {
    if (!commentText.trim() && !selectedImage) return;
    onCommentSubmit(
      post.id,
      commentText.trim(),
      replyTarget?.id,
      selectedImage || undefined,
    );
    setCommentText("");
    setReplyTarget(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Post date: detailed format (e.g., "2024년 1월 15일 오후 3:30")
  const formattedDate = format(
    new Date(post.timestamp),
    "yyyy년 M월 d일 a h:mm",
    {
      locale: ko,
    },
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.neutral[200],
        display: "flex",
        flexDirection: "column",
        transform: isAnimating ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      {/* iOS Navigation Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 44,
          backgroundColor: colors.baseWhite,
          borderBottom: `1px solid ${colors.neutral[100]}`,
          paddingLeft: 4,
          paddingRight: 4,
        }}
      >
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
          backgroundColor: colors.neutral[200],
        }}
      >
        {/* Post Cell - iOS SocialDetailPostCell */}
        <div
          style={{
            backgroundColor: colors.baseWhite,
            padding: 20,
            borderRadius: "0 0 16px 16px",
            marginBottom: 4,
          }}
        >
          {/* Header Row: Avatar + Info + More */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <TDAvatar src={post.user.profileImageUrl} size="small" />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: typography.mediumBody2.fontSize,
                      fontWeight: typography.mediumBody2.fontWeight,
                      color: colors.neutral[700],
                      display: "block",
                      lineHeight: "21px",
                    }}
                  >
                    {post.isAnonymous ? "익명" : post.user.nickname}
                  </span>
                  <span
                    style={{
                      fontSize: typography.regularCaption1.fontSize,
                      color: colors.neutral[500],
                      display: "block",
                      lineHeight: "12px",
                      marginTop: 2,
                    }}
                  >
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Stack - starts at same leading as Avatar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 10,
            }}
          >
            {/* Title */}
            {post.titleText && (
              <span
                style={{
                  fontSize: typography.boldBody1.fontSize,
                  fontWeight: typography.boldBody1.fontWeight,
                  color: colors.neutral[800],
                  lineHeight: 1.4,
                }}
              >
                {post.titleText}
              </span>
            )}

            {/* Content */}
            <p
              style={{
                fontSize: typography.regularBody4.fontSize,
                lineHeight: 1.6,
                color: colors.neutral[800],
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {post.contentText}
            </p>

            {/* Routine */}
            {post.routine && <SocialRoutineView routine={post.routine} />}

            {/* Images - horizontal scroll */}
            {post.imageList && post.imageList.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  overflowX: "auto",
                  marginRight: -20,
                  paddingRight: 20,
                }}
              >
                {post.imageList.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt=""
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 4,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Separator */}
          <div
            style={{
              height: 1,
              backgroundColor: colors.neutral[100],
              margin: "14px 0",
            }}
          />

          {/* Footer - iOS Regular style */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 24,
            }}
          >
            {/* Left: Comment */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <img src={commentIcon} alt="" style={{ width: 24, height: 24 }} />
              <span
                style={{
                  fontSize: typography.mediumBody2.fontSize,
                  color: colors.neutral[500],
                }}
              >
                {comments.length}
              </span>
            </div>

            {/* Right: Like (no share) */}
            <button
              onClick={() => onLike(post.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <img
                src={post.isLike ? likeIcon : likeEmptyIcon}
                alt=""
                style={{ width: 24, height: 24 }}
              />
              <span
                style={{
                  fontSize: typography.mediumBody2.fontSize,
                  color: post.isLike
                    ? colors.primary[400]
                    : colors.neutral[500],
                }}
              >
                {post.likeCount}
              </span>
            </button>
          </div>
        </div>

        {/* Section divider */}
        <div style={{ height: 8, backgroundColor: colors.neutral[200] }} />

        {/* Comments */}
        {comments.map((comment) => (
          <CommentCell
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onLike={onCommentLike}
            onReply={(c) => {
              setReplyTarget(c);
              textareaRef.current?.focus();
            }}
            onDelete={onDeleteComment}
            onReport={onReportComment}
            onBlockUser={onBlockUser}
          />
        ))}

        {/* Bottom spacing */}
        <div style={{ height: 20 }} />
      </div>

      {/* Comment Input Area - iOS style */}
      <div style={{ backgroundColor: colors.baseWhite }}>
        {/* Reply Form */}
        {replyTarget && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 48,
              padding: "0 20px",
              backgroundColor: colors.neutral[200],
            }}
          >
            <span
              style={{
                fontSize: typography.mediumBody3.fontSize,
                color: colors.neutral[600],
              }}
            >
              {replyTarget.user.nickname}님에게 답글 남기기
            </span>
            <button
              onClick={() => setReplyTarget(null)}
              style={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={18} color={colors.neutral[500]} />
            </button>
          </div>
        )}

        {/* Image Preview - iOS CommentImageView style */}
        {imagePreview && (
          <div
            style={{
              backgroundColor: colors.neutral[200],
              padding: "10px 20px",
            }}
          >
            <span
              style={{
                fontSize: typography.mediumBody3.fontSize,
                color: colors.neutral[600],
                display: "block",
                marginBottom: 8,
              }}
            >
              사진
            </span>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={imagePreview}
                alt="선택된 이미지"
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 4,
                  objectFit: "cover",
                }}
              />
              {/* Remove button */}
              <button
                onClick={handleRemoveImage}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: colors.baseBlack,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                <X size={10} color={colors.baseWhite} />
              </button>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: "none" }}
        />

        {/* Input Row - iOS CommentInputForm style */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "12px 20px 16px",
          }}
        >
          {/* Image button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            style={{
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              border: "none",
              cursor: isSubmitting ? "default" : "pointer",
              padding: 0,
              marginTop: 6,
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            <Image size={24} color={colors.neutral[400]} />
          </button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 남겨주세요."
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: 8,
              backgroundColor: "transparent",
              border: "none",
              borderRadius: 0,
              fontSize: typography.mediumBody3.fontSize,
              lineHeight: "20px",
              resize: "none",
              outline: "none",
              minHeight: 36,
              maxHeight: 76,
              fontFamily: "inherit",
              opacity: isSubmitting ? 0.5 : 1,
            }}
            rows={1}
          />

          {/* Send button */}
          <button
            onClick={handleSubmitComment}
            disabled={(!commentText.trim() && !selectedImage) || isSubmitting}
            style={{
              padding: "8px 0",
              backgroundColor: "transparent",
              border: "none",
              cursor:
                (commentText.trim() || selectedImage) && !isSubmitting
                  ? "pointer"
                  : "default",
              fontSize: typography.boldBody2.fontSize,
              fontWeight: typography.boldBody2.fontWeight,
              color:
                (commentText.trim() || selectedImage) && !isSubmitting
                  ? colors.neutral[700]
                  : colors.neutral[400],
              whiteSpace: "nowrap",
            }}
          >
            {isSubmitting ? "업로드중..." : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
};
