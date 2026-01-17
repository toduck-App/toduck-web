import { apiClient } from './api';
import { Diary, DiaryStats, DiaryKeyword, Emotion } from '../types';

export interface CreateDiaryRequest {
  date: string;
  emotion: Emotion;
  title: string;
  memo: string;
  diaryImageUrls?: string[];
  keywordIds?: number[];
}

export interface UpdateDiaryRequest {
  emotion?: Emotion;
  title?: string;
  memo?: string;
  diaryImageUrls?: string[];
  keywordIds?: number[];
}

export const diaryService = {
  // Fetch diary list by month
  // API response: { code, content: [...], message }
  async fetchDiaries(yearMonth: string): Promise<Diary[]> {
    const response = await apiClient.get('/diary', {
      params: { yearMonth },
    });
    const data = response.data;
    // Handle API response format: { content: [...] }
    if (data && Array.isArray(data.content)) {
      return data.content;
    }
    // Fallback for various API response formats
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.diaries)) {
      return data.diaries;
    }
    if (data && Array.isArray(data.result)) {
      return data.result;
    }
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  },

  // Create new diary entry
  // API response: { code, content: {...}, message }
  async createDiary(data: CreateDiaryRequest): Promise<Diary> {
    const response = await apiClient.post('/diary', data);
    return response.data?.content ?? response.data;
  },

  // Update diary entry
  // API response: { code, content: {...}, message }
  async updateDiary(id: number, data: UpdateDiaryRequest): Promise<Diary> {
    const response = await apiClient.patch(`/diary/${id}`, data);
    return response.data?.content ?? response.data;
  },

  // Delete diary entry
  async deleteDiary(id: number): Promise<void> {
    await apiClient.delete(`/diary/${id}`);
  },

  // Fetch diary comparison count (current vs previous month)
  // API response: { code, content: { count: number }, message }
  async fetchCompareCount(yearMonth: string): Promise<{ currentMonth: number; previousMonth: number }> {
    try {
      const response = await apiClient.get('/diary/count', {
        params: { yearMonth },
      });
      const data = response.data?.content ?? response.data;
      return {
        currentMonth: data?.currentMonth ?? data?.currentMonthCount ?? data?.count ?? 0,
        previousMonth: data?.previousMonth ?? data?.previousMonthCount ?? data?.previousCount ?? 0,
      };
    } catch {
      return { currentMonth: 0, previousMonth: 0 };
    }
  },

  // Fetch diary streak
  async fetchStreak(): Promise<{ streak: number }> {
    try {
      const response = await apiClient.get('/diary/streak');
      const data = response.data?.content ?? response.data;
      return { streak: data?.streak ?? data?.count ?? 0 };
    } catch {
      return { streak: 0 };
    }
  },

  // Fetch focus percent for this month (iOS uses /concentration/percent)
  async fetchFocusPercent(yearMonth: string): Promise<number> {
    try {
      const response = await apiClient.get('/concentration/percent', {
        params: { yearMonth },
      });
      const data = response.data?.content ?? response.data;
      return data?.percent ?? data?.focusPercent ?? data?.average ?? data?.concentration ?? 0;
    } catch {
      return 0;
    }
  },

  // Fetch diary stats
  async fetchStats(yearMonth: string): Promise<DiaryStats> {
    const [compareCount, streak] = await Promise.all([
      this.fetchCompareCount(yearMonth),
      this.fetchStreak(),
    ]);
    return {
      currentMonthCount: compareCount.currentMonth,
      previousMonthCount: compareCount.previousMonth,
      streak: streak.streak,
    };
  },

  // Fetch user's keywords
  // API response: { code, content: [...], message }
  async fetchKeywords(): Promise<DiaryKeyword[]> {
    const response = await apiClient.get('/diary/user-keywords');
    const data = response.data;
    if (data && Array.isArray(data.content)) {
      return data.content;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  // Create custom keyword
  // API response: { code, content: {...}, message }
  async createKeyword(content: string): Promise<DiaryKeyword> {
    const response = await apiClient.post('/diary/user-keywords/create', { content });
    return response.data?.content ?? response.data;
  },

  // Delete keyword
  async deleteKeyword(id: number): Promise<void> {
    await apiClient.delete('/diary/user-keywords/delete', {
      data: { keywordId: id },
    });
  },
};
