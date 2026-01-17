import { apiClient } from './api';
import { Post, Comment, PostListResponse, PostCategory, User, Routine, CategoryColor, CategoryIconType } from '../types';

export interface CreatePostRequest {
  title?: string;
  content: string;
  socialImageUrls?: string[];
  socialCategoryIds: number[];
  routineId?: number;
  isAnonymous?: boolean;
}

export interface CreateCommentRequest {
  content: string;
  imageUrl?: string;
  parentId?: number;
}

// API response types (matching iOS TDPostDTO structure)
interface ApiOwner {
  ownerId: number;
  nickname: string;
  profileImageUrl?: string | null;
}

interface ApiSocialImage {
  socialImageId: number;
  url: string;
}

interface ApiSocialLikeInfo {
  likeCount: number;
  isLikedByMe: boolean;
}

interface ApiSocialCategory {
  socialCategoryId: number;
  name: string;
}

interface ApiRoutine {
  routineId: number;
  category: string;
  color: string;
  title: string;
  time?: string | null;
  isPublic: boolean;
  isInDeletedState: boolean;
  daysOfWeek?: string[];
  memo?: string | null;
  reminderTime?: string | null;
}

interface ApiComment {
  commentId: number;
  parentCommentId?: number | null;
  owner: ApiOwner;
  imageUrl?: string | null;
  hasImage: boolean;
  content: string;
  commentLikeInfo: ApiSocialLikeInfo;
  isReply: boolean;
  createdAt: string;
}

interface ApiPost {
  socialId: number;
  owner: ApiOwner;
  routine?: ApiRoutine | null;
  title?: string | null;
  content?: string | null;
  hasImages: boolean;
  images: ApiSocialImage[];
  socialLikeInfo: ApiSocialLikeInfo;
  comments?: ApiComment[];
  commentCount?: number;
  categories?: ApiSocialCategory[];
  createdAt: string;
}

interface ApiPostListResponse {
  hasMore: boolean;
  nextCursor?: number | null;
  results: ApiPost[];
}

// Category ID to PostCategory mapping
const categoryIdToPostCategory = (categoryId: number): PostCategory => {
  switch (categoryId) {
    case 1: return 'concentration';
    case 2: return 'memory';
    case 3: return 'mistake';
    case 4: return 'anxiety';
    case 5: return 'information';
    case 6:
    default: return 'normal';
  }
};

// PostCategory to category ID mapping (matching iOS PostCategory rawValue)
const postCategoryToId = (category: PostCategory): number => {
  switch (category) {
    case 'concentration': return 1;
    case 'memory': return 2;
    case 'mistake': return 3;
    case 'anxiety': return 4;
    case 'information': return 5;
    case 'normal': return 6;
    default: return 6;
  }
};

// Category name to PostCategory mapping
const categoryNameToPostCategory = (name: string): PostCategory => {
  switch (name.toUpperCase()) {
    case 'CONCENTRATION': return 'concentration';
    case 'MEMORY': return 'memory';
    case 'IMPULSE':
    case 'MISTAKE': return 'mistake';
    case 'ANXIETY': return 'anxiety';
    case 'INFORMATION': return 'information';
    case 'GENERAL':
    default: return 'normal';
  }
};

// Color string to CategoryColor mapping
const colorToCategoryColor = (color?: string): CategoryColor => {
  const colorMap: Record<string, CategoryColor> = {
    '#F9F2F2': 'back1',
    '#F0FDF1': 'back2',
    '#F1F5F9': 'back3',
    '#FEF3C7': 'back4',
    '#FCE7F3': 'back5',
  };
  return color ? (colorMap[color] ?? 'back1') : 'back1';
};

// Day of week mapping
const dayOfWeekToKorean = (day: string): string => {
  const dayMap: Record<string, string> = {
    'MONDAY': '월',
    'TUESDAY': '화',
    'WEDNESDAY': '수',
    'THURSDAY': '목',
    'FRIDAY': '금',
    'SATURDAY': '토',
    'SUNDAY': '일',
  };
  return dayMap[day] ?? day;
};

// Category name to icon type mapping (matching iOS UIImage+Category.swift)
const categoryNameToIconType = (category?: string): CategoryIconType => {
  if (!category) return 'none';
  const iconMap: Record<string, CategoryIconType> = {
    'COMPUTER': 'computer',
    'FOOD': 'food',
    'PENCIL': 'pencil',
    'RED_BOOK': 'redBook',
    'SLEEP': 'sleep',
    'POWER': 'power',
    'PEOPLE': 'people',
    'MEDICINE': 'medicine',
    'TALK': 'talk',
    'HEART': 'heart',
    'VEHICLE': 'vehicle',
    'NONE': 'none',
  };
  return iconMap[category.toUpperCase()] ?? 'none';
};

// Convert API routine to Routine type
const convertApiRoutine = (apiRoutine?: ApiRoutine | null): Routine | undefined => {
  if (!apiRoutine) return undefined;
  return {
    id: apiRoutine.routineId,
    title: apiRoutine.title,
    category: colorToCategoryColor(apiRoutine.color),
    categoryIcon: categoryNameToIconType(apiRoutine.category),
    isAllDay: !apiRoutine.time,
    isPublic: apiRoutine.isPublic,
    time: apiRoutine.time ?? undefined,
    repeatDays: apiRoutine.daysOfWeek?.map(dayOfWeekToKorean),
    memo: apiRoutine.memo ?? undefined,
    isFinished: false,
    shareCount: 0,
  };
};

// Convert API comments to Comment[] with nested replies
const convertApiComments = (apiComments?: ApiComment[]): Comment[] => {
  if (!apiComments || apiComments.length === 0) return [];

  const topLevelComments: Comment[] = [];
  const repliesDict: Record<number, Comment[]> = {};

  for (const c of apiComments) {
    const comment: Comment = {
      id: c.commentId,
      user: {
        id: c.owner.ownerId,
        nickname: c.owner.nickname,
        profileImageUrl: c.owner.profileImageUrl ?? undefined,
        title: undefined,
        followingCount: 0,
        followerCount: 0,
        postCount: 0,
      },
      content: c.content,
      imageUrl: c.hasImage ? (c.imageUrl ?? undefined) : undefined,
      timestamp: c.createdAt,
      createdAt: c.createdAt,
      isLike: c.commentLikeInfo?.isLikedByMe ?? false,
      likeCount: c.commentLikeInfo?.likeCount ?? 0,
      replies: [],
    };

    if (c.parentCommentId) {
      if (!repliesDict[c.parentCommentId]) {
        repliesDict[c.parentCommentId] = [];
      }
      repliesDict[c.parentCommentId].push(comment);
    } else {
      topLevelComments.push(comment);
    }
  }

  return topLevelComments.map((comment) => ({
    ...comment,
    replies: repliesDict[comment.id] || [],
  }));
};

// Convert API post to Post type (matching iOS convertToPost logic)
const convertApiPost = (apiPost: ApiPost): Post => {
  return {
    id: apiPost.socialId,
    user: {
      id: apiPost.owner.ownerId,
      nickname: apiPost.owner.nickname,
      profileImageUrl: apiPost.owner.profileImageUrl ?? undefined,
      title: undefined,
      followingCount: 0,
      followerCount: 0,
      postCount: 0,
    },
    titleText: apiPost.title ?? undefined,
    contentText: apiPost.content ?? '',
    imageList: apiPost.images.map(img => img.url),
    timestamp: apiPost.createdAt,
    likeCount: apiPost.socialLikeInfo.likeCount,
    isLike: apiPost.socialLikeInfo.isLikedByMe,
    commentCount: apiPost.commentCount ?? 0,
    routine: convertApiRoutine(apiPost.routine),
    categories: apiPost.categories?.map(c => categoryNameToPostCategory(c.name)) ?? ['normal'],
    isAnonymous: false,
    comments: convertApiComments(apiPost.comments),
  };
};

// Convert API response to PostListResponse
const convertApiPostListResponse = (data: ApiPostListResponse): PostListResponse => {
  return {
    posts: data.results.map(convertApiPost),
    nextCursor: data.nextCursor?.toString(),
    hasMore: data.hasMore,
  };
};

export const socialService = {
  // Fetch post list (cursor-based pagination)
  // API response: { code, content: { hasMore, nextCursor, results: [...] }, message }
  // iOS format: categoryIds as comma-separated integer IDs (e.g., "1,2,3")
  async fetchPosts(cursor?: string, category?: PostCategory): Promise<PostListResponse> {
    const params: Record<string, string | undefined> = { cursor };
    if (category) {
      params.categoryIds = String(postCategoryToId(category));
    }
    const response = await apiClient.get('/socials', { params });
    const rawData = response.data;
    const data = rawData?.content ?? rawData;

    // Handle API response with 'results' array (matching iOS TDPostListDTO)
    if (data?.results && Array.isArray(data.results)) {
      return convertApiPostListResponse(data as ApiPostListResponse);
    }

    // Fallback for other formats
    return {
      posts: Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [],
      nextCursor: data?.nextCursor?.toString() ?? data?.cursor,
      hasMore: data?.hasMore ?? false,
    };
  },

  // Search posts by keyword
  // API response: { code, content: { hasMore, nextCursor, results: [...] }, message }
  // iOS format: categoryIds as comma-separated integer IDs
  async searchPosts(keyword: string, cursor?: string, category?: PostCategory): Promise<PostListResponse> {
    const params: Record<string, string | undefined> = { keyword, cursor };
    if (category) {
      params.categoryIds = String(postCategoryToId(category));
    }
    const response = await apiClient.get('/socials/search', { params });
    const rawData = response.data;
    const data = rawData?.content ?? rawData;

    // Handle API response with 'results' array (matching iOS TDPostListDTO)
    if (data?.results && Array.isArray(data.results)) {
      return convertApiPostListResponse(data as ApiPostListResponse);
    }

    // Fallback for other formats
    return {
      posts: Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [],
      nextCursor: data?.nextCursor?.toString() ?? data?.cursor,
      hasMore: data?.hasMore ?? false,
    };
  },

  // Fetch single post
  // API response: { code, content: {...}, message }
  async fetchPost(postId: number): Promise<Post> {
    const response = await apiClient.get(`/socials/${postId}`);
    const data = response.data?.content ?? response.data;

    // Convert API response to Post type if it has socialId field
    if (data?.socialId !== undefined) {
      return convertApiPost(data as ApiPost);
    }

    return data;
  },

  // Create new post
  // API response: { code, content: {...}, message }
  async createPost(data: CreatePostRequest): Promise<Post> {
    const response = await apiClient.post('/socials', data);
    return response.data?.content ?? response.data;
  },

  // Update post (iOS: PATCH /socials/{postId} with TDPostUpdateRequestDTO format)
  // API response: { code, content: {...}, message }
  async updatePost(postId: number, data: Partial<CreatePostRequest>, prevTitle?: string): Promise<Post> {
    // iOS uses PATCH with specific fields including isChangeTitle, isChangeRoutine
    const updateDto = {
      isChangeTitle: data.title !== prevTitle, // Title was changed
      title: data.title,
      isChangeRoutine: false, // Routine change not supported in web yet
      routineId: data.routineId,
      content: data.content,
      isAnonymous: data.isAnonymous ?? false,
      socialCategoryIds: data.socialCategoryIds,
      socialImageUrls: data.socialImageUrls,
    };
    const response = await apiClient.patch(`/socials/${postId}`, updateDto);
    return response.data?.content ?? response.data;
  },

  // Delete post
  async deletePost(postId: number): Promise<void> {
    await apiClient.delete(`/socials/${postId}`);
  },

  // Like post
  async likePost(postId: number): Promise<void> {
    await apiClient.post(`/socials/${postId}/likes`);
  },

  // Unlike post
  async unlikePost(postId: number): Promise<void> {
    await apiClient.delete(`/socials/${postId}/likes`);
  },

  // Report post
  async reportPost(postId: number, reason: string): Promise<void> {
    await apiClient.post(`/socials/${postId}/report`, { reason });
  },

  // Create comment
  // API response: { code, content: { commentId }, message }
  async createComment(postId: number, data: CreateCommentRequest): Promise<number> {
    const response = await apiClient.post(`/socials/${postId}/comments`, data);
    const content = response.data?.content ?? response.data;
    return content?.commentId ?? content;
  },

  // Like comment
  async likeComment(postId: number, commentId: number): Promise<void> {
    await apiClient.post(`/socials/${postId}/comments/${commentId}/likes`);
  },

  // Unlike comment
  async unlikeComment(postId: number, commentId: number): Promise<void> {
    await apiClient.delete(`/socials/${postId}/comments/${commentId}/likes`);
  },

  // Delete comment
  async deleteComment(postId: number, commentId: number): Promise<void> {
    await apiClient.delete(`/socials/${postId}/comments/${commentId}`);
  },

  // Fetch user profile
  // API response: { code, content: {...}, message }
  async fetchUserProfile(userId: number): Promise<User> {
    const response = await apiClient.get(`/profiles/${userId}`);
    const data = response.data?.content ?? response.data;
    return {
      id: data?.userId ?? data?.id ?? userId,
      nickname: data?.nickname ?? '',
      profileImageUrl: data?.profileImageUrl ?? data?.imageUrl,
      title: data?.title,
      followerCount: data?.followerCount ?? 0,
      followingCount: data?.followingCount ?? 0,
      postCount: data?.postCount ?? data?.socialCount ?? 0,
    };
  },

  // Fetch user posts
  // API response: { code, content: { hasMore, nextCursor, results: [...] }, message }
  async fetchUserPosts(userId: number, cursor?: string): Promise<PostListResponse> {
    const response = await apiClient.get(`/profiles/${userId}/socials`, {
      params: { cursor },
    });
    const rawData = response.data;
    const data = rawData?.content ?? rawData;

    // Handle API response with 'results' array (matching iOS TDPostListDTO)
    if (data?.results && Array.isArray(data.results)) {
      return convertApiPostListResponse(data as ApiPostListResponse);
    }

    // Fallback for other formats
    return {
      posts: Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [],
      nextCursor: data?.nextCursor?.toString() ?? data?.cursor,
      hasMore: data?.hasMore ?? false,
    };
  },

  // Fetch user routines
  // API response: { code, content: [...], message }
  async fetchUserRoutines(userId: number): Promise<Routine[]> {
    const response = await apiClient.get(`/profiles/${userId}/routines`);
    const data = response.data;
    if (data && Array.isArray(data.content)) {
      return data.content;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  // Follow user
  async followUser(userId: number): Promise<void> {
    await apiClient.post(`/users/${userId}/follow`);
  },

  // Unfollow user
  async unfollowUser(userId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}/follow`);
  },

  // Block user
  async blockUser(userId: number): Promise<void> {
    await apiClient.post(`/users/${userId}/block`);
  },

  // Unblock user
  async unblockUser(userId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}/block`);
  },

  // Fetch blocked users
  // API response: { code, content: [...], message }
  async fetchBlockedUsers(): Promise<User[]> {
    const response = await apiClient.get('/my-page/blocked-users');
    const data = response.data;
    if (data && Array.isArray(data.content)) {
      return data.content;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },
};
