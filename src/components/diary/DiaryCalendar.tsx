import React, { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday as checkIsToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/typography";
import { Diary, Emotion } from "../../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mood images for calendar cells - iOS TDImage.Mood
import happyMood from "../../assets/images/mood/happy_Mood.png";
import goodMood from "../../assets/images/mood/good_Mood.png";
import loveMood from "../../assets/images/mood/love_Mood.png";
import sosoMood from "../../assets/images/mood/soso_Mood.png";
import sickMood from "../../assets/images/mood/sick_Mood.png";
import sadMood from "../../assets/images/mood/sad_Mood.png";
import angryMood from "../../assets/images/mood/angry_Mood.png";
import anxiousMood from "../../assets/images/mood/anxious_Mood.png";
import tiredMood from "../../assets/images/mood/tired_Mood.png";

interface DiaryCalendarProps {
  diaries: Diary[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

const emotionImages: Record<Emotion, string> = {
  happy: happyMood,
  good: goodMood,
  love: loveMood,
  soso: sosoMood,
  sick: sickMood,
  sad: sadMood,
  angry: angryMood,
  anxious: anxiousMood,
  tired: tiredMood,
};

// iOS: 일요일부터 시작
const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

export const DiaryCalendar: React.FC<DiaryCalendarProps> = ({
  diaries,
  selectedDate,
  onSelectDate,
  onMonthChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });

    // iOS: placeholderType = .none, 현재 달만 표시
    const startDayOfWeek = getDay(start);
    const paddingDays = Array(startDayOfWeek).fill(null);

    return [...paddingDays, ...daysInMonth];
  }, [currentMonth]);

  const diaryMap = useMemo(() => {
    const map = new Map<string, Diary>();
    if (Array.isArray(diaries)) {
      diaries.forEach((diary) => {
        const key = format(new Date(diary.date), "yyyy-MM-dd");
        map.set(key, diary);
      });
    }
    return map;
  }, [diaries]);

  const handlePrevMonth = () => {
    if (isAnimating) return;
    setSlideDirection("right");
    setIsAnimating(true);

    setTimeout(() => {
      const newMonth = subMonths(currentMonth, 1);
      setCurrentMonth(newMonth);
      onMonthChange(newMonth);
      setSlideDirection(null);
      setIsAnimating(false);
    }, 200);
  };

  const handleNextMonth = () => {
    if (isAnimating) return;
    setSlideDirection("left");
    setIsAnimating(true);

    setTimeout(() => {
      const newMonth = addMonths(currentMonth, 1);
      setCurrentMonth(newMonth);
      onMonthChange(newMonth);
      setSlideDirection(null);
      setIsAnimating(false);
    }, 200);
  };

  // 전체 캘린더 컨테이너 - 컨텐츠에 맞게 자동 조절
  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
    paddingBottom: 12,
  };

  // iOS: CalendarHeaderContainerView - height 40, border 1px neutral200, cornerRadius 8, leading 16
  const headerContainerStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    height: 40,
    padding: "0 12px",
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: 8,
  };

  // iOS: CalendarHeaderStackView - spacing 8
  const headerContentStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  // iOS: titleLabel - boldHeader5, neutral700
  const monthTitleStyle: React.CSSProperties = {
    fontSize: typography.boldHeader5.fontSize,
    fontWeight: typography.boldHeader5.fontWeight,
    color: colors.neutral[700],
  };

  // iOS: 네비게이션 버튼 컨테이너 - CalendarHeader 외부에 배치
  const navContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  };

  const navButtonContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const navButtonStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };

  // iOS: 달력 그리드 - top 36 from header, leading/trailing 20 (이미 부모가 16px이므로 추가 4px)
  const calendarContentStyle: React.CSSProperties = {
    padding: "0 4px",
    marginTop: 8,
  };

  // iOS: weekdayTextColor - neutral600
  const weekDaysRowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: 8,
  };

  const weekDayStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: 15,
    fontWeight: typography.boldBody2.fontWeight,
    color: colors.neutral[600],
    padding: "8px 0",
  };

  // iOS: 날짜 그리드
  const daysGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    rowGap: 6,
    transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
    transform: slideDirection === "left"
      ? "translateX(-20px)"
      : slideDirection === "right"
        ? "translateX(20px)"
        : "translateX(0)",
    opacity: slideDirection ? 0.3 : 1,
  };

  // iOS: 셀 컨테이너
  const cellContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "1",
    position: "relative",
  };

  // 요일 텍스트 색상 - 선택 여부와 관계없이 동일한 색상 유지
  const getDayTextColor = (day: Date) => {
    const dayOfWeek = getDay(day);
    if (dayOfWeek === 0) return colors.semantic.error; // 일요일 빨강
    if (dayOfWeek === 6) return colors.semantic.info; // 토요일 파랑
    return colors.neutral[800];
  };

  return (
    <div style={containerStyle}>
      {/* iOS: 헤더 영역 */}
      <div style={navContainerStyle}>
        {/* iOS: CalendarHeaderContainerView */}
        <div style={headerContainerStyle}>
          <span style={monthTitleStyle}>
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </span>
        </div>

        {/* iOS: 네비게이션 버튼 */}
        <div style={navButtonContainerStyle}>
          <button onClick={handlePrevMonth} style={navButtonStyle}>
            <ChevronLeft size={20} color={colors.neutral[600]} />
          </button>
          <button onClick={handleNextMonth} style={navButtonStyle}>
            <ChevronRight size={20} color={colors.neutral[600]} />
          </button>
        </div>
      </div>

      {/* iOS: 달력 콘텐츠 */}
      <div style={calendarContentStyle}>
        {/* iOS: 요일 헤더 */}
        <div style={weekDaysRowStyle}>
          {weekDays.map((day) => (
            <div key={day} style={weekDayStyle}>
              {day}
            </div>
          ))}
        </div>

        {/* iOS: 날짜 그리드 */}
        <div style={daysGridStyle}>
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} style={cellContainerStyle} />;
            }

            const dateKey = format(day, "yyyy-MM-dd");
            const diary = diaryMap.get(dateKey);
            const isSelected = isSameDay(day, selectedDate);
            const hasDiary = !!diary;
            const isToday = checkIsToday(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={dateKey}
                onClick={() => onSelectDate(day)}
                style={{
                  ...cellContainerStyle,
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  border: "none",
                  padding: 0,
                  opacity: isCurrentMonth ? 1 : 0.3,
                }}
              >
                {/* 오늘 표시 작은 점 (일자 오른쪽 위, 4x4, primary500) */}
                {isToday && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: colors.primary[500],
                      zIndex: 2,
                    }}
                  />
                )}

                {/* 선택 배경 (42x42, primary100, 원형) - 연하게 */}
                {/* 감정 이미지가 없을 때만 표시 */}
                {isSelected && !hasDiary && (
                  <div
                    style={{
                      position: "absolute",
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: colors.primary[100],
                    }}
                  />
                )}

                {/* 감정 이미지가 있으면 이미지 표시, 없으면 날짜 텍스트 */}
                {hasDiary ? (
                  <img
                    src={emotionImages[diary.emotion]}
                    alt={diary.emotion}
                    style={{
                      width: 42,
                      height: 42,
                      objectFit: "contain",
                      borderRadius: 21,
                      position: "relative",
                      zIndex: 1,
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: isSelected
                        ? typography.boldBody2.fontWeight
                        : typography.mediumBody2.fontWeight,
                      color: getDayTextColor(day),
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {format(day, "d")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
