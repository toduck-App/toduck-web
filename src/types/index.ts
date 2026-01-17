// Type definitions for the app

// User related types
export interface User {
  id: number;
  nickname: string;
  profileImageUrl?: string;
  title?: string;
  followingCount: number;
  followerCount: number;
  postCount: number;
}

// Auth related types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface QRLoginRequest {
  qrToken: string;
}

// Diary related types
export type Emotion = 'happy' | 'good' | 'love' | 'soso' | 'sick' | 'sad' | 'angry' | 'anxious' | 'tired';

export interface DiaryKeyword {
  id: number;
  content: string;
}

export interface Diary {
  id: number;
  date: string;
  emotion: Emotion;
  title: string;
  memo: string;
  diaryImageUrls: string[];
  diaryKeywords: DiaryKeyword[];
}

export interface DiaryListResponse {
  diaries: Diary[];
}

export interface DiaryStats {
  currentMonthCount: number;
  previousMonthCount: number;
  streak: number;
}

// Social related types
export type PostCategory = 'concentration' | 'memory' | 'mistake' | 'anxiety' | 'information' | 'normal';

export interface Comment {
  id: number;
  user: User;
  content: string;
  imageUrl?: string;
  timestamp: string;
  createdAt: string;
  isLike: boolean;
  likeCount: number;
  replies: Comment[];
}

export type CategoryIconType = 'computer' | 'food' | 'pencil' | 'redBook' | 'sleep' | 'power' | 'people' | 'medicine' | 'talk' | 'heart' | 'vehicle' | 'none';

export interface Routine {
  id: number;
  title: string;
  category: CategoryColor;
  categoryIcon?: CategoryIconType;
  isAllDay: boolean;
  isPublic: boolean;
  time?: string;
  repeatDays?: string[];
  memo?: string;
  isFinished: boolean;
  shareCount: number;
}

export interface Post {
  id: number;
  user: User;
  titleText?: string;
  contentText: string;
  imageList: string[];
  timestamp: string;
  likeCount: number;
  isLike: boolean;
  commentCount: number;
  routine?: Routine;
  categories: PostCategory[];
  isAnonymous: boolean;
  comments?: Comment[];
}

export interface PostListResponse {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}

// Category colors
export type CategoryColor =
  | 'back1' | 'back2' | 'back3' | 'back4' | 'back5'
  | 'back6' | 'back7' | 'back8' | 'back9' | 'back10'
  | 'back11' | 'back12' | 'back13' | 'back14' | 'back15'
  | 'back16' | 'back17' | 'back18' | 'back19' | 'back20';

// MyPage types
export interface MyPageMenuItem {
  id: string;
  label: string;
  type: 'navigation' | 'action';
}

export interface MyPageSection {
  title: string;
  items: MyPageMenuItem[];
}
