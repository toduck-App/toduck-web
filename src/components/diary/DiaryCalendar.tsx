import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { Diary, Emotion } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DiaryCalendarProps {
  diaries: Diary[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

const emotionColors: Record<Emotion, string> = {
  happy: colors.diary.happy,
  good: colors.diary.good,
  love: colors.diary.love,
  soso: colors.diary.soso,
  sick: colors.diary.sick,
  sad: colors.diary.sad,
  angry: colors.diary.angry,
  anxious: colors.diary.anxiety,
  tired: colors.diary.tired,
};

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

export const DiaryCalendar: React.FC<DiaryCalendarProps> = ({
  diaries,
  selectedDate,
  onSelectDate,
  onMonthChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });

    // Add padding for first week
    const startDayOfWeek = getDay(start);
    const paddingDays = Array(startDayOfWeek).fill(null);

    return [...paddingDays, ...daysInMonth];
  }, [currentMonth]);

  const diaryMap = useMemo(() => {
    const map = new Map<string, Diary>();
    if (Array.isArray(diaries)) {
      diaries.forEach((diary) => {
        const key = format(new Date(diary.date), 'yyyy-MM-dd');
        map.set(key, diary);
      });
    }
    return map;
  }, [diaries]);

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
    borderRadius: 16,
    padding: 16,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  };

  const monthTitleStyle: React.CSSProperties = {
    fontSize: typography.boldHeader4.fontSize,
    fontWeight: typography.boldHeader4.fontWeight,
    color: colors.neutral[800],
  };

  const navButtonStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 8,
  };

  const weekDaysRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: 8,
  };

  const weekDayStyle = (index: number): React.CSSProperties => ({
    textAlign: 'center',
    fontSize: typography.mediumCaption1.fontSize,
    fontWeight: typography.mediumCaption1.fontWeight,
    color: index === 0 ? colors.semantic.error : index === 6 ? colors.semantic.info : colors.neutral[600],
    padding: '8px 0',
  });

  const daysGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 4,
  };

  const getDayStyle = (day: Date | null, isSelected: boolean, hasDiary: boolean): React.CSSProperties => {
    if (!day) {
      return { visibility: 'hidden' as const };
    }

    const dayOfWeek = getDay(day);
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isToday = isSameDay(day, new Date());

    return {
      aspectRatio: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isSelected ? colors.primary[500] : 'transparent',
      borderRadius: 12,
      cursor: 'pointer',
      border: isToday && !isSelected ? `1px solid ${colors.primary[300]}` : 'none',
      opacity: isCurrentMonth ? 1 : 0.3,
    };
  };

  const getDayTextColor = (day: Date, isSelected: boolean) => {
    if (isSelected) return colors.baseWhite;
    const dayOfWeek = getDay(day);
    if (dayOfWeek === 0) return colors.semantic.error;
    if (dayOfWeek === 6) return colors.semantic.info;
    return colors.neutral[800];
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={handlePrevMonth} style={navButtonStyle}>
          <ChevronLeft size={20} color={colors.neutral[600]} />
        </button>
        <span style={monthTitleStyle}>
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </span>
        <button onClick={handleNextMonth} style={navButtonStyle}>
          <ChevronRight size={20} color={colors.neutral[600]} />
        </button>
      </div>

      {/* Week days header */}
      <div style={weekDaysRowStyle}>
        {weekDays.map((day, index) => (
          <div key={day} style={weekDayStyle(index)}>
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={daysGridStyle}>
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} style={{ visibility: 'hidden' }} />;
          }

          const dateKey = format(day, 'yyyy-MM-dd');
          const diary = diaryMap.get(dateKey);
          const isSelected = isSameDay(day, selectedDate);
          const hasDiary = !!diary;

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(day)}
              style={getDayStyle(day, isSelected, hasDiary)}
            >
              <span
                style={{
                  fontSize: typography.mediumBody2.fontSize,
                  fontWeight: isSelected ? typography.boldBody2.fontWeight : typography.mediumBody2.fontWeight,
                  color: getDayTextColor(day, isSelected),
                  marginBottom: 4,
                }}
              >
                {format(day, 'd')}
              </span>
              {hasDiary && !isSelected && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: emotionColors[diary.emotion],
                  }}
                />
              )}
              {isSelected && hasDiary && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.baseWhite,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
