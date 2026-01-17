import React, { useState, useEffect, useCallback, useRef } from "react";
import { colors } from "../styles/colors";
import { layout } from "../styles/layout";
import { NavigationBar } from "../components/layout/NavigationBar";
import { TDSegmentedControl } from "../components/common/TDSegmentedControl";
import { TDFloatingButton } from "../components/common/TDButton";
import {
  SocialFeedCard,
  SocialWriteView,
  SocialDetailView,
} from "../components/social";
import { socialService, CreatePostRequest } from "../services/socialService";
import { awsService } from "../services/awsService";
import { Post, PostCategory, Comment } from "../types";
import { X, Search, ChevronDown, ChevronLeft } from "lucide-react";
import { typography } from "../styles/typography";
import { useAuthStore } from "../store/authStore";

// iOS hardcoded popular keywords (matching SocialListViewModel.swift)
const POPULAR_KEYWORDS = [
  "루틴",
  "집중",
  "뽀모도로",
  "꿀팁",
  "시간관리",
  "ADHD",
  "일기",
];

// Local storage key for recent keywords
const RECENT_KEYWORDS_KEY = "social_recent_keywords";

// Sort icons (matching iOS TDImage.Sort)
import timeEmptyIcon from "../assets/icons/sort/timeEmpty.png";
import timeFillIcon from "../assets/icons/sort/timeFill.png";
import commentEmptyIcon from "../assets/icons/sort/commentEmpty.png";
import commentFillIcon from "../assets/icons/sort/commentFill.png";
import likeEmptyIcon from "../assets/icons/sort/likeEmpty.png";
import likeFillIcon from "../assets/icons/sort/likeFill.png";

// iOS PostCategory titles (matching TDDomain/Entity/Enum/PostCategory.swift)
const categoryChips = [
  { id: "concentration", label: "집중력" },
  { id: "memory", label: "기억력" },
  { id: "mistake", label: "실수" },
  { id: "anxiety", label: "불안" },
  { id: "information", label: "정보" },
  { id: "normal", label: "기타" },
];

// iOS SocialSortType (matching TDDomain/Entity/Social/SocialSortType.swift)
type SortType = "recent" | "comment" | "sympathy";
const sortOptions: {
  id: SortType;
  label: string;
  iconEmpty: string;
  iconFill: string;
}[] = [
  {
    id: "recent",
    label: "최신순",
    iconEmpty: timeEmptyIcon,
    iconFill: timeFillIcon,
  },
  {
    id: "comment",
    label: "댓글순",
    iconEmpty: commentEmptyIcon,
    iconFill: commentFillIcon,
  },
  {
    id: "sympathy",
    label: "공감순",
    iconEmpty: likeEmptyIcon,
    iconFill: likeFillIcon,
  },
];

export const SocialPage: React.FC = () => {
  const { userId } = useAuthStore();
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [showWriteView, setShowWriteView] = useState(false);
  const [isPostSubmitting, setIsPostSubmitting] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sortType, setSortType] = useState<SortType>("recent");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null); // For edit mode

  // Search mode states (iOS SocialListViewController pattern)
  const [isSearchMode, setIsSearchMode] = useState(false); // Search UI shown
  const [searchInputValue, setSearchInputValue] = useState(""); // Current input value
  const [activeSearchTerm, setActiveSearchTerm] = useState(""); // Term being searched (after enter)
  const [showKeywordView, setShowKeywordView] = useState(false); // Show keyword suggestions
  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll to top on segment change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedSegment]);

  // Scroll to top on search mode change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isSearchMode]);

  // Prevent body scroll when detail view or write view is open
  useEffect(() => {
    if (showDetailView || showWriteView) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDetailView, showWriteView]);

  // Load recent keywords from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_KEYWORDS_KEY);
    if (stored) {
      try {
        setRecentKeywords(JSON.parse(stored));
      } catch {
        setRecentKeywords([]);
      }
    }
  }, []);

  // Save keyword to recent keywords
  const saveRecentKeyword = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setRecentKeywords((prev) => {
      const filtered = prev.filter((k) => k !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 10); // Max 10 keywords
      localStorage.setItem(RECENT_KEYWORDS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Delete individual recent keyword
  const deleteRecentKeyword = useCallback((keyword: string) => {
    setRecentKeywords((prev) => {
      const updated = prev.filter((k) => k !== keyword);
      localStorage.setItem(RECENT_KEYWORDS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Delete all recent keywords
  const deleteAllRecentKeywords = useCallback(() => {
    setRecentKeywords([]);
    localStorage.removeItem(RECENT_KEYWORDS_KEY);
  }, []);

  // Client-side sorting (matching iOS SocialListViewModel.sort)
  const sortPosts = useCallback(
    (postsToSort: Post[]): Post[] => {
      const sorted = [...postsToSort];
      switch (sortType) {
        case "recent":
          return sorted.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          );
        case "comment":
          return sorted.sort((a, b) => b.commentCount - a.commentCount);
        case "sympathy":
          return sorted.sort((a, b) => b.likeCount - a.likeCount);
        default:
          return sorted;
      }
    },
    [sortType],
  );

  // Fetch posts (supports both normal and search mode)
  const fetchPosts = useCallback(
    async (reset = false) => {
      if (isLoading && !reset) return;

      setIsLoading(true);
      try {
        // Only filter by category when on "주제별" tab (selectedSegment === 1) and a chip is selected
        const category =
          selectedSegment === 1 && selectedCategory
            ? (selectedCategory as PostCategory)
            : undefined;

        let response;
        if (activeSearchTerm) {
          // Search mode: use searchPosts API with category filter
          response = await socialService.searchPosts(
            activeSearchTerm,
            reset ? undefined : cursor,
            category,
          );
        } else {
          // Normal mode: use fetchPosts API
          response = await socialService.fetchPosts(
            reset ? undefined : cursor,
            category,
          );
        }
        const newPosts = response.posts || [];
        setPosts(reset ? newPosts : [...(posts || []), ...newPosts]);
        setCursor(response.nextCursor);
        setHasMore(response.hasMore);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        if (reset) setPosts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      cursor,
      posts,
      selectedCategory,
      selectedSegment,
      activeSearchTerm,
    ],
  );

  // Enter search mode (iOS: show search bar in header)
  const enterSearchMode = useCallback(() => {
    setIsSearchMode(true);
    setShowKeywordView(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  // Exit search mode (iOS: back to default navigation)
  const exitSearchMode = useCallback(() => {
    setIsSearchMode(false);
    setShowKeywordView(false);
    setSearchInputValue("");
    setActiveSearchTerm("");
    setPosts([]);
    setCursor(undefined);
    setHasMore(true);
  }, []);

  // Execute search (iOS: on Enter or keyword tap)
  const executeSearch = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;

      saveRecentKeyword(trimmed);
      setSearchInputValue(trimmed);
      setActiveSearchTerm(trimmed);
      setShowKeywordView(false);
      setPosts([]);
      setCursor(undefined);
      setHasMore(true);
    },
    [saveRecentKeyword],
  );

  // Clear search (iOS: return to normal feed within search mode)
  const clearSearch = useCallback(() => {
    setActiveSearchTerm("");
    setSearchInputValue("");
    setShowKeywordView(true);
    setPosts([]);
    setCursor(undefined);
    setHasMore(true);
  }, []);

  // Refetch when segment, category, or search term changes
  useEffect(() => {
    // Don't fetch when in search mode showing keyword view
    if (isSearchMode && showKeywordView) return;
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedSegment,
    selectedCategory,
    activeSearchTerm,
    isSearchMode,
    showKeywordView,
  ]);

  // Infinite scroll - iOS style: load more when near bottom (1.5x frame height threshold)
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Load more when scroll position is within 1.5x viewport height from bottom
      if (scrollTop + clientHeight > scrollHeight - clientHeight * 0.5) {
        fetchPosts(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore, fetchPosts]);

  const handleLike = async (postId: number) => {
    const post = (posts || []).find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    const updatePosts = (postList: Post[]) =>
      (postList || []).map((p) =>
        p.id === postId
          ? {
              ...p,
              isLike: !p.isLike,
              likeCount: p.isLike ? p.likeCount - 1 : p.likeCount + 1,
            }
          : p,
      );

    setPosts(updatePosts(posts || []));

    if (selectedPost?.id === postId) {
      setSelectedPost({
        ...selectedPost,
        isLike: !selectedPost.isLike,
        likeCount: selectedPost.isLike
          ? selectedPost.likeCount - 1
          : selectedPost.likeCount + 1,
      });
    }

    try {
      if (post.isLike) {
        await socialService.unlikePost(postId);
      } else {
        await socialService.likePost(postId);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      fetchPosts(true);
    }
  };

  const handleCommentLike = async (commentId: number) => {
    // Find comment in top-level or replies
    let targetComment: Comment | undefined;

    for (const c of comments || []) {
      if (c.id === commentId) {
        targetComment = c;
        break;
      }
      const reply = c.replies?.find((r) => r.id === commentId);
      if (reply) {
        targetComment = reply;
        break;
      }
    }

    if (!targetComment) return;

    // Optimistic update
    setComments(
      (comments || []).map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            isLike: !c.isLike,
            likeCount: c.isLike ? c.likeCount - 1 : c.likeCount + 1,
          };
        }
        // Check replies
        if (c.replies?.some((r) => r.id === commentId)) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId
                ? {
                    ...r,
                    isLike: !r.isLike,
                    likeCount: r.isLike ? r.likeCount - 1 : r.likeCount + 1,
                  }
                : r,
            ),
          };
        }
        return c;
      }),
    );

    try {
      if (selectedPost) {
        if (targetComment.isLike) {
          await socialService.unlikeComment(selectedPost.id, commentId);
        } else {
          await socialService.likeComment(selectedPost.id, commentId);
        }
      }
    } catch (error) {
      console.error("Failed to toggle comment like:", error);
    }
  };

  const handlePostClick = async (postId: number) => {
    try {
      const post = await socialService.fetchPost(postId);
      setSelectedPost(post);
      setComments(post.comments || []);
      setShowDetailView(true);
    } catch (error) {
      console.error("Failed to fetch post:", error);
    }
  };

  const handleCommentSubmit = async (
    postId: number,
    content: string,
    parentId?: number,
    imageFile?: File,
  ) => {
    setIsCommentSubmitting(true);
    try {
      let imageUrl: string | undefined;

      // Upload image if provided
      if (imageFile) {
        imageUrl = await awsService.uploadImageAndGetUrl(imageFile);
      }

      // Create comment with image URL
      await socialService.createComment(postId, {
        content,
        parentId,
        imageUrl,
      });

      // Refresh post data to get updated comments
      const post = await socialService.fetchPost(postId);
      setSelectedPost(post);
      setComments(post.comments || []);
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleWritePost = async (data: {
    postId?: number;
    title?: string;
    content: string;
    socialCategoryIds: number[];
    images?: File[];
    existingImageUrls?: string[];
  }) => {
    setIsPostSubmitting(true);
    try {
      // Upload new images if provided
      let newImageUrls: string[] = [];
      if (data.images && data.images.length > 0) {
        newImageUrls = await Promise.all(
          data.images.map((file) => awsService.uploadImageAndGetUrl(file))
        );
      }

      // Combine existing image URLs with new ones
      const allImageUrls = [
        ...(data.existingImageUrls || []),
        ...newImageUrls,
      ];

      if (data.postId && editingPost) {
        // Update existing post (pass previous title for isChangeTitle flag)
        await socialService.updatePost(
          data.postId,
          {
            title: data.title,
            content: data.content,
            socialCategoryIds: data.socialCategoryIds,
            socialImageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
          },
          editingPost.titleText
        );
      } else {
        // Create new post
        const request: CreatePostRequest = {
          title: data.title,
          content: data.content,
          socialCategoryIds: data.socialCategoryIds,
          isAnonymous: false,
          socialImageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
        };
        await socialService.createPost(request);
      }

      setShowWriteView(false);
      setEditingPost(null);
      fetchPosts(true);
    } catch (error) {
      console.error("Failed to save post:", error);
    } finally {
      setIsPostSubmitting(false);
    }
  };

  // Handle edit post from feed card
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowWriteView(true);
  };

  // Handle delete post from feed card (not from detail view)
  const handleDeletePostFromFeed = async (postId: number) => {
    try {
      await socialService.deletePost(postId);
      fetchPosts(true);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await socialService.deletePost(postId);
      setShowDetailView(false);
      fetchPosts(true);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!selectedPost) return;
    try {
      await socialService.deleteComment(selectedPost.id, commentId);
      // Remove the comment from local state (including nested replies)
      const removeComment = (comments: Comment[]): Comment[] => {
        return comments
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: removeComment(c.replies || []),
          }));
      };
      setComments(removeComment(comments));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleBlockUser = async (blockUserId: number) => {
    try {
      await socialService.blockUser(blockUserId);
      setShowDetailView(false);
      fetchPosts(true);
    } catch (error) {
      console.error("Failed to block user:", error);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: colors.baseWhite,
  };

  // Fixed header container that includes NavigationBar + Segment tabs
  const fixedHeaderStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    zIndex: 100,
    backgroundColor: colors.baseWhite,
    borderLeft: "1px solid rgb(248, 248, 248)",
    borderRight: "1px solid rgb(248, 248, 248)",
  };

  const headerContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `0 ${layout.sectionHorizontalInset}px`,
    position: "relative",
    backgroundColor: colors.baseWhite,
    height: 43,
  };

  // iOS SocialListDropdownView style - anchor button
  const dropdownAnchorStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 5,
    height: 43,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };

  // iOS TDDropdownHoverView - dropdown menu overlay
  const dropdownOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
    display: showSortDropdown ? "block" : "none",
  };

  // iOS dropdown menu container
  const dropdownMenuStyle: React.CSSProperties = {
    position: "fixed",
    top: layout.navBarHeight + 43, // Below nav + segment
    right: "calc(50% - 215px + 16px)", // Inside 430px container, 16px from right
    width: 110,
    backgroundColor: colors.baseWhite,
    borderRadius: 8,
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    zIndex: 201,
  };

  const segmentBottomLineStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.neutral[200],
  };

  // iOS TDChipCollectionView style with slide-down animation
  const chipContainerStyle: React.CSSProperties = {
    padding: `0 ${layout.sectionHorizontalInset}px`, // No vertical padding, chips have their own margin
    display: "flex",
    gap: 8,
    overflowX: "auto",
    backgroundColor: colors.baseWhite,
    // Slide-down animation
    maxHeight: selectedSegment === 1 ? 53 : 0,
    opacity: selectedSegment === 1 ? 1 : 0,
    overflow: "hidden",
    transition: "max-height 0.25s ease-out, opacity 0.2s ease-out",
  };

  // Calculate header height: navBar(56) + segmentControl(43) + chips(animated: 0-53)
  // Normal feed container height - DO NOT CHANGE
  const baseHeaderHeight =
    layout.navBarHeight + layout.social.segmentedControlHeight - 55;
  const chipAreaHeight = selectedSegment === 1 ? 40 : 0;
  const headerHeight = baseHeaderHeight + chipAreaHeight;

  const feedContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    paddingTop: headerHeight,
    paddingBottom: 100,
    transition: "padding-top 0.25s ease-out", // Sync with chip animation
  };

  // Position floating button inside app container (max-width 430px centered)
  const floatingButtonContainerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: layout.tabBarHeight + 20,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    display: "flex",
    justifyContent: "flex-end",
    paddingRight: 16,
    pointerEvents: "none",
    zIndex: 50,
  };

  // iOS SocialSearchView - search header bar style
  const searchHeaderBarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: layout.navBarHeight,
    padding: `0 ${layout.sectionHorizontalInset}px`,
    backgroundColor: colors.baseWhite,
  };

  // iOS search input container (neutral50 background)
  const searchInputContainerStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 36,
    padding: "0 12px",
    backgroundColor: colors.neutral[50],
    borderRadius: 10,
  };

  const searchInputStyle: React.CSSProperties = {
    flex: 1,
    height: "100%",
    backgroundColor: "transparent",
    border: "none",
    fontSize: 14,
    outline: "none",
    color: colors.neutral[800],
  };

  // iOS keyword section styles
  const keywordSectionStyle: React.CSSProperties = {
    padding: `16px ${layout.sectionHorizontalInset}px`,
  };

  const keywordSectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  };

  const keywordTagContainerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  };

  // iOS TagCell style (popular keyword)
  const popularTagStyle: React.CSSProperties = {
    padding: "8px 14px",
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    fontSize: 14,
    color: colors.neutral[700],
    border: "none",
    cursor: "pointer",
  };

  // iOS CancleTagCell style (recent keyword with X button)
  const recentTagStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 10px 8px 14px",
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    fontSize: 14,
    color: colors.neutral[700],
    border: "none",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      {/* Fixed header containing NavigationBar + Segment tabs + Category chips */}
      <div style={fixedHeaderStyle}>
        {/* Conditional: Search Header vs Default Navigation */}
        {isSearchMode ? (
          <div style={searchHeaderBarStyle}>
            {/* Back button */}
            <button
              onClick={exitSearchMode}
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={24} color={colors.neutral[800]} />
            </button>

            {/* Search input */}
            <div style={searchInputContainerStyle}>
              <Search size={16} color={colors.neutral[400]} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onFocus={() => setShowKeywordView(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    executeSearch(searchInputValue);
                  }
                }}
                placeholder="제목이나 키워드를 검색해보세요."
                style={searchInputStyle}
              />
              {searchInputValue && (
                <button
                  onClick={clearSearch}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={16} color={colors.neutral[400]} />
                </button>
              )}
            </div>

            {/* Cancel button */}
            <button
              onClick={exitSearchMode}
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                fontSize: 14,
                color: colors.neutral[600],
              }}
            >
              취소
            </button>
          </div>
        ) : (
          <NavigationBar
            showLogo
            showSearchButton
            onSearchClick={enterSearchMode}
            style={{
              position: "relative",
              transform: "none",
              left: 0,
              borderLeft: "none",
              borderRight: "none",
            }}
          />
        )}

        {/* Segment Control Header - hidden when keyword view is shown */}
        {!(isSearchMode && showKeywordView) && (
          <div style={headerContainerStyle}>
            <TDSegmentedControl
              items={["전체", "주제별"]}
              selectedIndex={selectedSegment}
              onChange={setSelectedSegment}
              width={layout.social.segmentedControlWidth}
              variant="underline"
            />

            {/* Sort Dropdown Anchor - iOS SocialListDropdownView */}
            <button
              style={dropdownAnchorStyle}
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <span
                style={{
                  fontSize: typography.boldBody2.fontSize,
                  fontWeight: typography.boldBody2.fontWeight,
                  color: colors.neutral[700],
                }}
              >
                {sortOptions.find((o) => o.id === sortType)?.label}
              </span>
              <ChevronDown size={24} color={colors.neutral[500]} />
            </button>

            <div style={segmentBottomLineStyle} />
          </div>
        )}

        {/* Category Chips (shown when "주제별" selected, hidden when keyword view) */}
        {!(isSearchMode && showKeywordView) && (
          <div style={chipContainerStyle}>
            {categoryChips.map((chip) => {
              const isSelected = selectedCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    // Toggle: click again to deselect (show all)
                    setSelectedCategory(isSelected ? null : chip.id);
                  }}
                  style={{
                    padding: "0 12px", // Reduced horizontal padding
                    height: 33, // iOS chipType.height
                    margin: "10px 0", // Vertical margin on each chip
                    borderRadius: 8, // iOS chipType.cornerRadius
                    backgroundColor: isSelected
                      ? colors.primary[500] // iOS activeColor
                      : colors.baseWhite, // iOS inActiveColor
                    color: isSelected
                      ? colors.baseWhite // iOS fontColor.activeColor
                      : colors.neutral[700], // iOS fontColor.inActiveColor
                    border: isSelected
                      ? "1px solid transparent" // iOS borderColor.activeColor (clear)
                      : `1px solid ${colors.neutral[200]}`, // iOS borderColor.inActiveColor
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Feed or Keyword View */}
      <div style={feedContainerStyle}>
        {/* Keyword suggestions view (when in search mode and no active search) */}
        {isSearchMode && showKeywordView ? (
          <div style={{ marginTop: -45 }}>
            {/* Pull up to compensate for hidden segment control */}
            {/* Recent Keywords Section */}
            {recentKeywords.length > 0 && (
              <div style={keywordSectionStyle}>
                <div style={keywordSectionHeaderStyle}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: colors.neutral[800],
                    }}
                  >
                    최근 검색어
                  </span>
                  <button
                    onClick={deleteAllRecentKeywords}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      color: colors.neutral[500],
                    }}
                  >
                    전체 삭제
                  </button>
                </div>
                <div style={keywordTagContainerStyle}>
                  {recentKeywords.map((keyword) => (
                    <button
                      key={keyword}
                      style={recentTagStyle}
                      onClick={() => executeSearch(keyword)}
                    >
                      <span>{keyword}</span>
                      <X
                        size={14}
                        color={colors.neutral[400]}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecentKeyword(keyword);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Keywords Section */}
            <div style={keywordSectionStyle}>
              <div style={keywordSectionHeaderStyle}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.neutral[800],
                  }}
                >
                  인기 검색어
                </span>
              </div>
              <div style={keywordTagContainerStyle}>
                {POPULAR_KEYWORDS.map((keyword) => (
                  <button
                    key={keyword}
                    style={popularTagStyle}
                    onClick={() => executeSearch(keyword)}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Feed posts */}
            {sortPosts(posts || []).map((post) => (
              <SocialFeedCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={(id) => handlePostClick(id)}
                onClick={(id) => handlePostClick(id)}
                highlightTerm={activeSearchTerm}
                currentUserId={userId ?? undefined}
                onEdit={handleEditPost}
                onDelete={handleDeletePostFromFeed}
              />
            ))}

            {isLoading && (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: colors.neutral[500],
                }}
              >
                로딩 중...
              </div>
            )}

            {!isLoading && (posts || []).length === 0 && (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: colors.neutral[500],
                }}
              >
                {activeSearchTerm
                  ? "검색 결과가 없습니다."
                  : "아직 게시글이 없습니다."}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Write Button */}
      <div style={floatingButtonContainerStyle}>
        <TDFloatingButton
          title="글쓰기"
          onClick={() => setShowWriteView(true)}
          style={{ pointerEvents: "auto" }}
        />
      </div>

      {/* Write View Container - clips animation within app area */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          height: "100%",
          overflow: "hidden",
          pointerEvents: showWriteView ? "auto" : "none",
          zIndex: 1000,
        }}
      >
        <SocialWriteView
          isOpen={showWriteView}
          onClose={() => {
            setShowWriteView(false);
            setEditingPost(null);
          }}
          onSubmit={handleWritePost}
          isSubmitting={isPostSubmitting}
          editPost={editingPost ?? undefined}
        />
      </div>

      {/* Detail View Container - clips animation within app area */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          height: "100%",
          overflow: "hidden",
          pointerEvents: showDetailView ? "auto" : "none",
          zIndex: 1000,
        }}
      >
        <SocialDetailView
          isOpen={showDetailView}
          post={selectedPost}
          comments={comments}
          currentUserId={userId ?? undefined}
          isSubmitting={isCommentSubmitting}
          onClose={() => setShowDetailView(false)}
          onLike={handleLike}
          onCommentLike={handleCommentLike}
          onCommentSubmit={handleCommentSubmit}
          onDeletePost={handleDeletePost}
          onDeleteComment={handleDeleteComment}
          onBlockUser={handleBlockUser}
        />
      </div>

      {/* Sort Dropdown Overlay - iOS TDDropdownHoverView */}
      <div
        style={dropdownOverlayStyle}
        onClick={() => setShowSortDropdown(false)}
      >
        <div style={dropdownMenuStyle} onClick={(e) => e.stopPropagation()}>
          {sortOptions.map((option, index) => {
            const isSelected = sortType === option.id;
            const isFirst = index === 0;
            const isLast = index === sortOptions.length - 1;
            return (
              <button
                key={option.id}
                onClick={() => {
                  setSortType(option.id);
                  setShowSortDropdown(false);
                }}
                style={{
                  width: "100%",
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 20px 0 16px",
                  backgroundColor: isSelected
                    ? colors.primary[50]
                    : colors.baseWhite,
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                  borderRadius: isFirst
                    ? "6px 6px 0 0"
                    : isLast
                      ? "0 0 6px 6px"
                      : 0,
                }}
              >
                <img
                  src={isSelected ? option.iconFill : option.iconEmpty}
                  alt=""
                  style={{
                    width: 16,
                    height: 16,
                    objectFit: "contain",
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isSelected
                      ? colors.primary[500]
                      : colors.neutral[800],
                  }}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
