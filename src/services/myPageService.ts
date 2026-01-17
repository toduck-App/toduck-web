import { apiClient } from './api';
import { User, Post, Comment } from '../types';
import { useAuthStore } from '../store/authStore';

const getUserId = (): number | null => {
  return useAuthStore.getState().userId;
};

export const myPageService = {
  // Fetch nickname only (iOS uses this for diary analyze view)
  // API response format: { code: 20000, content: { nickname: "..." }, message: null }
  async fetchNickname(): Promise<string> {
    try {
      const response = await apiClient.get('/my-page/nickname');
      const data = response.data;
      // API returns { content: { nickname: "..." } }
      if (typeof data?.content?.nickname === 'string') return data.content.nickname;
      if (typeof data?.nickname === 'string') return data.nickname;
      return '';
    } catch {
      return '';
    }
  },

  // Fetch my profile (iOS uses /profiles/{userId})
  // API response format: { code: 20000, content: { userId, nickname, ... }, message: null }
  async fetchMyProfile(): Promise<User> {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }
    const response = await apiClient.get(`/profiles/${userId}`);
    // API returns { content: {...} }
    const data = response.data?.content ?? response.data;
    // Map response to User type
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

  // Fetch my posts
  // API response: { code, content: {...}, message }
  async fetchMyPosts(cursor?: string): Promise<{ posts: Post[]; nextCursor?: string }> {
    const response = await apiClient.get('/my-page/posts', {
      params: { cursor },
    });
    const data = response.data?.content ?? response.data;
    return {
      posts: data?.posts ?? [],
      nextCursor: data?.nextCursor,
    };
  },

  // Fetch my comments
  // API response: { code, content: {...}, message }
  async fetchMyComments(cursor?: string): Promise<{ comments: Comment[]; nextCursor?: string }> {
    const response = await apiClient.get('/my-page/comments', {
      params: { cursor },
    });
    const data = response.data?.content ?? response.data;
    return {
      comments: data?.comments ?? [],
      nextCursor: data?.nextCursor,
    };
  },

  // Update profile (iOS uses separate endpoints for nickname and image)
  async updateProfile(data: { nickname?: string; profileImageUrl?: string }): Promise<void> {
    const promises: Promise<unknown>[] = [];

    if (data.nickname !== undefined) {
      promises.push(apiClient.patch('/my-page/nickname', { nickname: data.nickname }));
    }

    if (data.profileImageUrl !== undefined) {
      promises.push(apiClient.patch('/my-page/profile-image', { imageUrl: data.profileImageUrl }));
    }

    await Promise.all(promises);
  },

  // Delete account
  async deleteAccount(): Promise<void> {
    const userId = getUserId();
    if (userId) {
      await apiClient.delete(`/users/${userId}`);
    }
  },
};
