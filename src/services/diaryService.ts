import { apiClient } from './api';
import { Diary, DiaryStats, DiaryKeyword, Emotion, DiaryStreakInfo } from '../types';

export interface CreateDiaryRequest {
  date: string;
  emotion: Emotion;
  title: string;
  memo: string;
  diaryImageUrls?: string[];
  keywordIds?: number[]; // Note: Keywords are connected via separate API call
}

export interface UpdateDiaryRequest {
  emotion?: Emotion;
  title?: string;
  memo?: string;
  diaryImageUrls?: string[];
  keywordIds?: number[]; // Note: Keywords are connected via separate API call
}

// Helper function to map API diary DTO to web Diary type
// API response structure from iOS DiaryListResponseDTO:
// - diaryImages: [{ diaryImageId, url }]
// - diaryKeywords: [{ keywordId, keywordName }]
const mapDiaryDto = (dto: {
  diaryId: number;
  date: string;
  emotion: string;
  title: string | null;
  memo: string | null;
  diaryImages: { diaryImageId: number; url: string }[] | null;
  diaryKeywords: { keywordId: number; keywordName: string }[];
}): Diary => ({
  id: dto.diaryId,
  date: dto.date,
  emotion: dto.emotion.toLowerCase() as Emotion,
  title: dto.title || '',
  memo: dto.memo || '',
  diaryImageUrls: (dto.diaryImages || []).map((img) => img.url),
  diaryKeywords: (dto.diaryKeywords || []).map((k) => ({
    id: k.keywordId,
    content: k.keywordName,
  })),
});

export const diaryService = {
  // Fetch diary list by month
  // API response: { code, content: { diaryDtos: [...] }, message }
  async fetchDiaries(yearMonth: string): Promise<Diary[]> {
    const response = await apiClient.get('/diary', {
      params: { yearMonth },
    });
    const data = response.data;

    // Handle API response format: { content: { diaryDtos: [...] } }
    if (data?.content?.diaryDtos && Array.isArray(data.content.diaryDtos)) {
      return data.content.diaryDtos.map(mapDiaryDto);
    }
    // Fallback for direct array in content
    if (data && Array.isArray(data.content)) {
      return data.content.map(mapDiaryDto);
    }
    // Fallback for various API response formats
    if (Array.isArray(data)) {
      return data.map(mapDiaryDto);
    }
    if (data && Array.isArray(data.diaries)) {
      return data.diaries.map(mapDiaryDto);
    }
    if (data && Array.isArray(data.result)) {
      return data.result.map(mapDiaryDto);
    }
    if (data && Array.isArray(data.data)) {
      return data.data.map(mapDiaryDto);
    }
    return [];
  },

  // Connect keywords to diary
  // API: POST /v1/diaryKeyword
  // Request: { diaryId, keywordIds }
  async connectKeywords(diaryId: number, keywordIds: number[]): Promise<void> {
    if (!keywordIds || keywordIds.length === 0) return;
    await apiClient.post('/diaryKeyword', {
      diaryId,
      keywordIds,
    });
  },

  // Create new diary entry
  // API response: { code, content: {...}, message }
  // API expects uppercase emotion: HAPPY, GOOD, LOVE, SOSO, SICK, SAD, ANGRY, ANXIOUS, TIRED
  // Note: Keywords are connected via separate API call after diary creation (like iOS)
  async createDiary(data: CreateDiaryRequest): Promise<Diary> {
    const { keywordIds, ...diaryData } = data;

    // 1. Create diary without keywords
    const requestData = {
      ...diaryData,
      emotion: diaryData.emotion.toUpperCase(),
    };
    const response = await apiClient.post('/diary', requestData);

    // 2. Connect keywords if any (like iOS flow)
    if (keywordIds && keywordIds.length > 0) {
      // Fetch diary list to get the created diary's ID
      const yearMonth = data.date.substring(0, 7); // "2025-12-01" -> "2025-12"
      const diaries = await this.fetchDiaries(yearMonth);
      const createdDiary = diaries.find((d) => d.date === data.date);

      if (createdDiary) {
        await this.connectKeywords(createdDiary.id, keywordIds);
      }
    }

    return response.data?.content ?? response.data;
  },

  // Update diary entry
  // API response: { code, content: {...}, message }
  // API expects uppercase emotion: HAPPY, GOOD, LOVE, SOSO, SICK, SAD, ANGRY, ANXIOUS, TIRED
  // Note: Keywords are connected via separate API call after diary update (like iOS)
  async updateDiary(id: number, data: UpdateDiaryRequest): Promise<Diary> {
    const { keywordIds, ...diaryData } = data;

    // 1. Update diary
    const requestData = {
      ...diaryData,
      ...(diaryData.emotion && { emotion: diaryData.emotion.toUpperCase() }),
      // iOS sends isChangeEmotion flag
      isChangeEmotion: !!diaryData.emotion,
    };
    const response = await apiClient.patch(`/diary/${id}`, requestData);

    // 2. Connect keywords if provided (like iOS flow)
    if (keywordIds !== undefined) {
      await this.connectKeywords(id, keywordIds || []);
    }

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
  // API: GET /v1/user-keywords
  // Response: { content: { userKeywordDtos: [...] } }
  async fetchKeywords(): Promise<DiaryKeyword[]> {
    const response = await apiClient.get('/user-keywords');
    const data = response.data;
    // Handle API response format: { content: { userKeywordDtos: [...] } }
    if (data?.content?.userKeywordDtos && Array.isArray(data.content.userKeywordDtos)) {
      return data.content.userKeywordDtos.map((dto: { id: number; category: string; keyword: string }) => ({
        id: dto.id,
        content: dto.keyword,
        category: dto.category,
      }));
    }
    if (data && Array.isArray(data.content)) {
      return data.content;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  // Create custom keyword
  // API: POST /v1/user-keywords/create
  async createKeyword(content: string, category: string = 'CUSTOM'): Promise<DiaryKeyword> {
    const response = await apiClient.post('/user-keywords/create', {
      keywordCategory: category.toUpperCase(),
      keyword: content,
    });
    return response.data?.content ?? response.data;
  },

  // Delete keyword
  // API: DELETE /v1/user-keywords/delete
  async deleteKeyword(keyword: string, category: string = 'CUSTOM'): Promise<void> {
    await apiClient.delete('/user-keywords/delete', {
      data: {
        keywordCategory: category.toUpperCase(),
        keyword: keyword,
      },
    });
  },

  // Fetch streak info
  // API: GET /v1/diary/streak
  // Response: { streak: number, lastDiaryDate: string }
  async fetchWeeklyStreak(): Promise<DiaryStreakInfo> {
    try {
      const response = await apiClient.get('/diary/streak');
      const data = response.data?.content ?? response.data;
      const streak = data?.streak ?? 0;
      // Generate weekly streak array based on streak count (filled from left to right)
      const weeklyStreak = Array(7).fill(false).map((_, i) => i < Math.min(streak, 7));
      return {
        currentStreak: streak,
        weeklyStreak,
      };
    } catch {
      return {
        currentStreak: 0,
        weeklyStreak: [false, false, false, false, false, false, false],
      };
    }
  },

  // Upload diary images
  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await apiClient.post('/diary/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data?.content ?? response.data;
      return data?.urls ?? data ?? [];
    } catch {
      return [];
    }
  },
};
