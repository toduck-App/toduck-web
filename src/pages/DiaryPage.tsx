import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, isSameDay } from 'date-fns';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { NavigationBar } from '../components/layout/NavigationBar';
import { TDButton } from '../components/common/TDButton';
import { DiaryCalendar, DiaryAnalyzeView, DiaryCard, DiaryWriteModal } from '../components/diary';
import { diaryService, CreateDiaryRequest } from '../services/diaryService';
import { myPageService } from '../services/myPageService';
import { Diary } from '../types';

interface DiaryAnalyzeData {
  nickname: string;
  diaryCountDiff: number;
  focusPercent: number;
}

export const DiaryPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [analyzeData, setAnalyzeData] = useState<DiaryAnalyzeData>({
    nickname: '',
    diaryCountDiff: 0,
    focusPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);

  // Fetch diaries for current month
  const fetchDiaries = useCallback(async (date: Date) => {
    setIsLoading(true);
    try {
      const yearMonth = format(date, 'yyyy-MM');
      const data = await diaryService.fetchDiaries(yearMonth);
      setDiaries(data);
    } catch (error) {
      console.error('Failed to fetch diaries:', error);
      setDiaries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAnalyzeData = useCallback(async (date: Date) => {
    try {
      const yearMonth = format(date, 'yyyy-MM');
      const [nickname, compareCount, focusPercent] = await Promise.all([
        myPageService.fetchNickname(),
        diaryService.fetchCompareCount(yearMonth),
        diaryService.fetchFocusPercent(yearMonth),
      ]);
      setAnalyzeData({
        nickname: nickname,
        diaryCountDiff: compareCount.currentMonth - compareCount.previousMonth,
        focusPercent: focusPercent,
      });
    } catch (error) {
      console.error('Failed to fetch analyze data:', error);
    }
  }, []);

  useEffect(() => {
    fetchDiaries(selectedDate);
    fetchAnalyzeData(selectedDate);
  }, [fetchDiaries, fetchAnalyzeData, selectedDate]);

  const handleMonthChange = (date: Date) => {
    fetchDiaries(date);
    fetchAnalyzeData(date);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSaveDiary = async (diary: Partial<Diary>) => {
    try {
      const request: CreateDiaryRequest = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        emotion: diary.emotion!,
        title: diary.title || '',
        memo: diary.memo || '',
        diaryImageUrls: diary.diaryImageUrls,
        keywordIds: diary.diaryKeywords?.map(k => k.id),
      };

      if (selectedDiary) {
        await diaryService.updateDiary(selectedDiary.id, request);
      } else {
        await diaryService.createDiary(request);
      }

      setShowWriteModal(false);
      fetchDiaries(selectedDate);
      fetchAnalyzeData(selectedDate);
    } catch (error) {
      console.error('Failed to save diary:', error);
    }
  };

  // Get selected date's diary
  const selectedDiary = useMemo(() => {
    if (!Array.isArray(diaries)) return undefined;
    return diaries.find((d) => isSameDay(new Date(d.date), selectedDate));
  }, [diaries, selectedDate]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.baseWhite,
  };

  const scrollContentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: 100,
  };

  const stackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  const calendarContainerStyle: React.CSSProperties = {
    padding: `0 ${layout.sectionHorizontalInset}px`,
    backgroundColor: colors.baseWhite,
  };

  const selectedDiaryContainerStyle: React.CSSProperties = {
    padding: `0 ${layout.sectionHorizontalInset}px`,
  };

  const postButtonContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: layout.tabBarHeight + 16,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    padding: `0 ${layout.sectionHorizontalInset}px`,
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle}>
      <NavigationBar
        showLogo
        backgroundColor={colors.neutral[50]}
      />

      <div style={scrollContentStyle}>
        <div style={stackStyle}>
          {/* Analyze View */}
          <DiaryAnalyzeView
            nickname={analyzeData.nickname}
            diaryCountDiff={analyzeData.diaryCountDiff}
            focusPercent={analyzeData.focusPercent}
          />

          {/* Calendar */}
          <div style={calendarContainerStyle}>
            <DiaryCalendar
              diaries={diaries}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onMonthChange={handleMonthChange}
            />
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div style={{ textAlign: 'center', color: colors.neutral[500], padding: 20 }}>
              로딩 중...
            </div>
          )}

          {/* Selected Diary Card */}
          {selectedDiary && !isLoading && (
            <div style={selectedDiaryContainerStyle}>
              <DiaryCard
                diary={selectedDiary}
                onClick={() => setShowWriteModal(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Write Button */}
      <div style={postButtonContainerStyle}>
        <TDButton
          title={selectedDiary ? '일기 수정' : '일기 작성'}
          onClick={() => setShowWriteModal(true)}
        />
      </div>

      {/* Write Modal */}
      <DiaryWriteModal
        isOpen={showWriteModal}
        onClose={() => setShowWriteModal(false)}
        onSave={handleSaveDiary}
        selectedDate={selectedDate}
        existingDiary={selectedDiary}
      />
    </div>
  );
};
