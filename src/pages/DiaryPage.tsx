import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, isSameDay, isAfter, startOfDay } from "date-fns";
import { colors } from "../styles/colors";
import { layout } from "../styles/layout";
import { NavigationBar } from "../components/layout/NavigationBar";
import { TDButton } from "../components/common/TDButton";
import {
  DiaryCalendar,
  DiaryAnalyzeView,
  DiaryWriteView,
  SimpleDiaryView,
  DiaryDetailView,
  DiaryEmptyState,
  DiaryArchiveButton,
} from "../components/diary";
import { diaryService, CreateDiaryRequest } from "../services/diaryService";
import { myPageService } from "../services/myPageService";
import { Diary } from "../types";

interface DiaryAnalyzeData {
  nickname: string;
  diaryCountDiff: number;
  focusPercent: number;
}

export const DiaryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [analyzeData, setAnalyzeData] = useState<DiaryAnalyzeData>({
    nickname: "",
    diaryCountDiff: 0,
    focusPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showWriteView, setShowWriteView] = useState(false);
  const [showSimpleDiary, setShowSimpleDiary] = useState(false);

  // Fetch diaries for current month
  const fetchDiaries = useCallback(async (date: Date) => {
    setIsLoading(true);
    try {
      const yearMonth = format(date, "yyyy-MM");
      const data = await diaryService.fetchDiaries(yearMonth);
      setDiaries(data);
    } catch (error) {
      console.error("Failed to fetch diaries:", error);
      setDiaries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAnalyzeData = useCallback(async (date: Date) => {
    try {
      const yearMonth = format(date, "yyyy-MM");
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
      console.error("Failed to fetch analyze data:", error);
    }
  }, []);

  useEffect(() => {
    fetchDiaries(selectedDate);
    fetchAnalyzeData(selectedDate);
  }, []);

  const handleMonthChange = (date: Date) => {
    fetchDiaries(date);
    fetchAnalyzeData(date);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSaveDiary = async (diary: Partial<Diary>) => {
    const request: CreateDiaryRequest = {
      date: format(selectedDate, "yyyy-MM-dd"),
      emotion: diary.emotion!,
      title: diary.title || "",
      memo: diary.memo || "",
      diaryImageUrls: diary.diaryImageUrls,
      keywordIds: diary.diaryKeywords?.map((k) => k.id),
    };

    if (selectedDiary) {
      await diaryService.updateDiary(selectedDiary.id, request);
    } else {
      await diaryService.createDiary(request);
    }

    fetchDiaries(selectedDate);
    fetchAnalyzeData(selectedDate);
  };

  const handleOpenSimpleDiary = () => {
    setShowWriteView(false);
    setShowSimpleDiary(true);
  };

  const handleCloseSimpleDiary = () => {
    setShowSimpleDiary(false);
  };

  const handleDeleteDiary = async () => {
    if (!selectedDiary) return;

    try {
      await diaryService.deleteDiary(selectedDiary.id);
      fetchDiaries(selectedDate);
      fetchAnalyzeData(selectedDate);
    } catch (error) {
      console.error("Failed to delete diary:", error);
      throw error;
    }
  };

  const handleArchiveClick = () => {
    navigate("/diary/archive");
  };

  // Get selected date's diary
  const selectedDiary = useMemo(() => {
    if (!Array.isArray(diaries)) return undefined;
    return diaries.find((d) => isSameDay(new Date(d.date), selectedDate));
  }, [diaries, selectedDate]);

  // Check if selected date is in the future
  const isFutureDate = useMemo(() => {
    const today = startOfDay(new Date());
    const selected = startOfDay(selectedDate);
    return isAfter(selected, today);
  }, [selectedDate]);

  // Should show write button - only when no diary exists and not future date
  const shouldShowWriteButton = useMemo(() => {
    if (isFutureDate) return false; // 미래 날짜에서는 숨김
    if (selectedDiary) return false; // 일기가 존재하면 숨김
    return true;
  }, [isFutureDate, selectedDiary]);

  // Styles
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: colors.baseWhite,
  };

  const scrollContentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
  };

  const stackStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
  };

  // 캘린더 컨테이너 (흰색 배경)
  const diaryContentContainerStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
    padding: "4px 16px 0",
    marginTop: 24,
  };

  // 캘린더 영역
  const calendarContainerStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
  };

  // 상세 보기 / 빈 상태 영역
  const detailContainerStyle: React.CSSProperties = {
    backgroundColor: colors.neutral[100],
    padding: "12px 10px",
  };

  // 하단 버튼 영역
  const postButtonContainerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: layout.tabBarHeight,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    padding: "28px 16px",
    boxSizing: "border-box",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    zIndex: 50,
  };

  return (
    <div style={containerStyle}>
      <NavigationBar showLogo backgroundColor={colors.neutral[50]} />

      <div style={scrollContentStyle}>
        <div style={stackStyle}>
          {/* Analyze View - 높이 230px */}
          <DiaryAnalyzeView
            nickname={analyzeData.nickname}
            diaryCountDiff={analyzeData.diaryCountDiff}
            focusPercent={analyzeData.focusPercent}
          />

          {/* Diary Content Container */}
          <div style={diaryContentContainerStyle}>
            {/* Calendar */}
            <div style={calendarContainerStyle}>
              <DiaryCalendar
                diaries={diaries}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onMonthChange={handleMonthChange}
              />
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div
              style={{
                textAlign: "center",
                color: colors.neutral[500],
                padding: 20,
              }}
            >
              로딩 중...
            </div>
          )}

          {/* Diary Detail View OR Empty State */}
          {!isLoading && (
            <>
              {selectedDiary ? (
                <>
                  <div style={detailContainerStyle}>
                    <DiaryDetailView
                      diary={selectedDiary}
                      onEdit={() => setShowSimpleDiary(true)}
                      onDelete={handleDeleteDiary}
                    />
                  </div>
                  <DiaryArchiveButton onClick={handleArchiveClick} />
                </>
              ) : (
                <DiaryEmptyState />
              )}
            </>
          )}
        </div>
      </div>

      {/* Write Button - only shown when no diary exists */}
      {shouldShowWriteButton && (
        <div style={postButtonContainerStyle}>
          <TDButton
            title="일기 작성"
            onClick={() => setShowWriteView(true)}
          />
        </div>
      )}

      {/* Diary Write View - 3 Step Flow */}
      <DiaryWriteView
        isOpen={showWriteView}
        onClose={() => setShowWriteView(false)}
        onSave={handleSaveDiary}
        onOpenSimpleDiary={handleOpenSimpleDiary}
        selectedDate={selectedDate}
      />

      {/* Simple Diary View - Edit Mode or Simple Write */}
      <SimpleDiaryView
        isOpen={showSimpleDiary}
        onClose={handleCloseSimpleDiary}
        onSave={handleSaveDiary}
        onDelete={selectedDiary ? handleDeleteDiary : undefined}
        selectedDate={selectedDate}
        existingDiary={selectedDiary}
      />
    </div>
  );
};
