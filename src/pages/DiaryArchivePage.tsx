import React, { useState, useEffect, useCallback } from 'react';
import { format, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';
import { DiaryDetailView } from '../components/diary';
import { diaryService } from '../services/diaryService';
import { Diary } from '../types';
import { useNavigate } from 'react-router-dom';

export const DiaryArchivePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDiaries = useCallback(async (date: Date) => {
    setIsLoading(true);
    try {
      const yearMonth = format(date, 'yyyy-MM');
      const data = await diaryService.fetchDiaries(yearMonth);
      // 날짜 역순 정렬 (최신순)
      const sorted = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : [];
      setDiaries(sorted);
    } catch (error) {
      console.error('Failed to fetch diaries:', error);
      setDiaries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiaries(currentMonth);
  }, [currentMonth, fetchDiaries]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditDiary = (diary: Diary) => {
    // TODO: Open edit modal or navigate to edit page
    console.log('Edit diary:', diary.id);
  };

  const handleDeleteDiary = async (diary: Diary) => {
    if (window.confirm('정말 이 일기를 삭제하시겠습니까?')) {
      try {
        await diaryService.deleteDiary(diary.id);
        fetchDiaries(currentMonth);
      } catch (error) {
        console.error('Failed to delete diary:', error);
      }
    }
  };

  // 이번 달이고 오늘 일기가 없으면 작성 버튼 표시
  const showTodayButton = isSameMonth(currentMonth, new Date()) && 
    !diaries.some(d => isToday(new Date(d.date)));

  // Styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.neutral[100],
  };

  // iOS: 네비게이션 바
  const navBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    padding: '0 16px',
    backgroundColor: colors.baseWhite,
    borderBottom: `1px solid ${colors.neutral[200]}`,
  };

  const backButtonStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  const navTitleStyle: React.CSSProperties = {
    fontSize: typography.boldHeader4.fontSize,
    fontWeight: typography.boldHeader4.fontWeight,
    color: colors.neutral[800],
  };

  // iOS: 캘린더 헤더 (월 선택)
  const headerContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    padding: '0 12px',
    margin: '16px 16px 0',
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: 8,
    backgroundColor: colors.baseWhite,
  };

  const monthButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  };

  const monthTitleStyle: React.CSSProperties = {
    fontSize: typography.boldHeader5.fontSize,
    fontWeight: typography.boldHeader5.fontWeight,
    color: colors.neutral[800],
  };

  const navButtonContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const navButtonStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  };

  // 일기 리스트 컨테이너
  const listContainerStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px 16px',
    paddingBottom: showTodayButton ? 100 : 20,
  };

  const diaryCardWrapperStyle: React.CSSProperties = {
    marginBottom: 16,
  };

  // 오늘 일기 작성 버튼
  const todayButtonContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: layout.tabBarHeight,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    padding: '20px 16px',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  };

  const todayButtonStyle: React.CSSProperties = {
    width: '100%',
    height: 52,
    backgroundColor: colors.primary[500],
    color: colors.baseWhite,
    fontSize: typography.boldBody1.fontSize,
    fontWeight: typography.boldBody1.fontWeight,
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      {/* 네비게이션 바 */}
      <div style={navBarStyle}>
        <button style={backButtonStyle} onClick={handleBack}>
          <ChevronLeft size={24} color={colors.neutral[800]} />
        </button>
        <span style={navTitleStyle}>일기 모아보기</span>
        <div style={{ width: 40 }} /> {/* Spacer */}
      </div>

      {/* 월 선택 헤더 */}
      <div style={headerContainerStyle}>
        <button
          style={monthButtonStyle}
          onClick={() => {/* TODO: 월 선택 모달 */}}
        >
          <span style={monthTitleStyle}>
            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
          </span>
          <ChevronDown size={18} color={colors.neutral[600]} />
        </button>

        <div style={navButtonContainerStyle}>
          <button onClick={handlePrevMonth} style={navButtonStyle}>
            <ChevronLeft size={20} color={colors.neutral[600]} />
          </button>
          <button onClick={handleNextMonth} style={navButtonStyle}>
            <ChevronRight size={20} color={colors.neutral[600]} />
          </button>
        </div>
      </div>

      {/* 일기 리스트 */}
      <div style={listContainerStyle}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: colors.neutral[500], padding: 40 }}>
            로딩 중...
          </div>
        ) : diaries.length === 0 ? (
          <div style={{ textAlign: 'center', color: colors.neutral[500], padding: 40 }}>
            이 달에 작성한 일기가 없습니다.
          </div>
        ) : (
          diaries.map((diary) => (
            <div key={diary.id} style={diaryCardWrapperStyle}>
              <DiaryDetailView
                diary={diary}
                onEdit={() => handleEditDiary(diary)}
                onDelete={() => handleDeleteDiary(diary)}
              />
            </div>
          ))
        )}
      </div>

      {/* 오늘 일기 작성 버튼 */}
      {showTodayButton && (
        <div style={todayButtonContainerStyle}>
          <button
            style={todayButtonStyle}
            onClick={() => navigate('/diary')}
          >
            오늘 일기 작성하기
          </button>
        </div>
      )}
    </div>
  );
};
