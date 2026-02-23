import React, { useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TDLabel } from '../common/TDLabel';
import { DiaryKeyword } from '../../types';
import { diaryService } from '../../services/diaryService';
import { KeywordAddModal } from './KeywordAddModal';

// Icons
import tomatoSmall from '../../assets/images/icons/tomato_Small.png';
import peopleIcon from '../../assets/images/diary/keyword/people.png';
import placeIcon from '../../assets/images/diary/keyword/place.png';
import talkIcon from '../../assets/images/diary/keyword/talk.png';
import heartIcon from '../../assets/images/diary/keyword/heart.png';

interface KeywordSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKeywords: DiaryKeyword[];
  onSelect: (keywords: DiaryKeyword[]) => void;
}

// iOS categories: 사람, 장소, 상황, 결과/느낌
type KeywordCategory = 'all' | 'PERSON' | 'PLACE' | 'SITUATION' | 'RESULT';

const categoryLabels: Record<KeywordCategory, string> = {
  all: '전체',
  PERSON: '사람',
  PLACE: '장소',
  SITUATION: '상황',
  RESULT: '결과 / 느낌',
};

// iOS category icons - actual image assets
const categoryIcons: Record<Exclude<KeywordCategory, 'all'>, string> = {
  PERSON: peopleIcon,
  PLACE: placeIcon,
  SITUATION: talkIcon,
  RESULT: heartIcon,
};

// Category display order
const categoryOrder: Exclude<KeywordCategory, 'all'>[] = ['PERSON', 'PLACE', 'SITUATION', 'RESULT'];

export const KeywordSheet: React.FC<KeywordSheetProps> = ({
  isOpen,
  onClose,
  selectedKeywords,
  onSelect,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [localSelectedKeywords, setLocalSelectedKeywords] = useState<DiaryKeyword[]>(selectedKeywords);
  const [allKeywords, setAllKeywords] = useState<DiaryKeyword[]>([]);
  const [category, setCategory] = useState<KeywordCategory>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [keywordsToDelete, setKeywordsToDelete] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedKeywords(selectedKeywords);
      fetchKeywords();
      setIsDeleteMode(false);
      setKeywordsToDelete(new Set());
    }
  }, [isOpen, selectedKeywords]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setShowAddModal(false);
        setIsDeleteMode(false);
        setKeywordsToDelete(new Set());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const fetchKeywords = async () => {
    setIsLoading(true);
    try {
      const keywords = await diaryService.fetchKeywords();
      setAllKeywords(keywords);
    } catch (error) {
      console.error('Failed to fetch keywords:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = async (keywordText: string, keywordCategory: string) => {
    try {
      await diaryService.createKeyword(keywordText, keywordCategory);
      setShowAddModal(false);
      // 키워드 리스트 새로고침
      await fetchKeywords();
    } catch (error) {
      console.error('Failed to create keyword:', error);
    }
  };

  const handleToggleKeyword = (keyword: DiaryKeyword) => {
    if (isDeleteMode) {
      setKeywordsToDelete((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(keyword.id)) {
          newSet.delete(keyword.id);
        } else {
          newSet.add(keyword.id);
        }
        return newSet;
      });
    } else {
      const isSelected = localSelectedKeywords.some((k) => k.id === keyword.id);
      if (isSelected) {
        setLocalSelectedKeywords((prev) => prev.filter((k) => k.id !== keyword.id));
      } else {
        setLocalSelectedKeywords((prev) => [...prev, keyword]);
      }
    }
  };

  const handleDeleteKeywords = async () => {
    for (const id of keywordsToDelete) {
      const keyword = allKeywords.find(k => k.id === id);
      if (keyword) {
        try {
          await diaryService.deleteKeyword(keyword.content, keyword.category || 'SITUATION');
        } catch (error) {
          console.error('Failed to delete keyword:', error);
        }
      }
    }
    setAllKeywords((prev) => prev.filter((k) => !keywordsToDelete.has(k.id)));
    setLocalSelectedKeywords((prev) => prev.filter((k) => !keywordsToDelete.has(k.id)));
    setKeywordsToDelete(new Set());
    setIsDeleteMode(false);
  };

  const handleDone = () => {
    onSelect(localSelectedKeywords);
  };

  // Group keywords by category
  const getKeywordsByCategory = (cat: Exclude<KeywordCategory, 'all'>) => {
    return allKeywords.filter(k => k.category === cat);
  };

  // Get categories to display based on filter
  const categoriesToDisplay = category === 'all'
    ? categoryOrder
    : [category as Exclude<KeywordCategory, 'all'>];

  if (!shouldRender) return null;

  // iOS: Overlay
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1100,
    transition: 'background-color 0.3s ease',
  };

  // iOS: Sheet - increased height for more content
  const sheetStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 430,
    height: '85vh',
    maxHeight: 700,
    backgroundColor: colors.baseWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    display: 'flex',
    flexDirection: 'column',
    transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
  };

  // iOS: Segmented control - underline style like screenshot
  const segmentContainerStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: `1px solid ${colors.neutral[200]}`,
    padding: '0 16px',
  };

  const getSegmentStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '16px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: isActive ? `2px solid ${colors.neutral[800]}` : '2px solid transparent',
    cursor: 'pointer',
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: isActive ? typography.boldBody2.fontWeight : typography.mediumBody2.fontWeight,
    color: isActive ? colors.neutral[800] : colors.neutral[400],
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    marginBottom: -1,
  });

  // iOS: Action buttons row
  const actionButtonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    padding: '16px 16px 12px',
  };

  // iOS: Add/Delete button style
  const actionButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    padding: '0 12px',
    backgroundColor: colors.baseWhite,
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: colors.neutral[700],
  };

  // iOS: Content area
  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '0 16px',
    paddingBottom: 16,
  };

  // iOS: Section header style (icon + category name)
  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 12,
  };

  const sectionIconStyle: React.CSSProperties = {
    width: 16,
    height: 16,
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: colors.neutral[500],
  };

  // iOS: Left-aligned grid of keyword chips
  const keywordGridStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    rowGap: 10,
  };

  // iOS: Keyword chip style - neutral100 bg (normal), primary100 bg + primary500 text (selected)
  const getKeywordChipStyle = (isSelected: boolean): React.CSSProperties => {
    if (isDeleteMode) {
      return {
        padding: '6px 12px',
        backgroundColor: isSelected ? colors.baseWhite : colors.neutral[100],
        border: isSelected ? `1px solid ${colors.semantic.error}` : '1px solid transparent',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: typography.mediumBody2.fontSize,
        fontWeight: typography.mediumBody2.fontWeight,
        color: isSelected ? colors.semantic.error : colors.neutral[700],
        transition: 'all 0.15s ease',
      };
    }
    return {
      padding: '6px 12px',
      backgroundColor: isSelected ? colors.primary[100] : colors.neutral[100],
      border: '1px solid transparent',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: typography.mediumBody2.fontSize,
      fontWeight: typography.mediumBody2.fontWeight,
      color: isSelected ? colors.primary[500] : colors.neutral[700],
      transition: 'all 0.15s ease',
    };
  };

  // iOS: Footer with buttons
  const footerStyle: React.CSSProperties = {
    padding: '12px 16px 24px',
    display: 'flex',
    gap: 10,
  };

  const cancelButtonStyle: React.CSSProperties = {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.baseWhite,
    border: `1px solid ${colors.neutral[300]}`,
    fontSize: typography.boldHeader3.fontSize,
    fontWeight: typography.boldHeader3.fontWeight,
    color: colors.neutral[700],
    cursor: 'pointer',
  };

  const saveButtonStyle: React.CSSProperties = {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    border: 'none',
    fontSize: typography.boldHeader3.fontSize,
    fontWeight: typography.boldHeader3.fontWeight,
    color: colors.baseWhite,
    cursor: 'pointer',
  };

  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    color: colors.neutral[500],
  };

  // iOS: Header style
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '24px 16px 16px',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        {/* iOS: Header with tomato icon + "오늘의 키워드" */}
        <div style={headerStyle}>
          <img src={tomatoSmall} alt="" style={{ width: 24, height: 24 }} />
          <TDLabel text="오늘의 키워드" font="boldHeader4" color={colors.neutral[800]} />
        </div>

        {/* iOS: Segmented control for categories - underline style */}
        <div style={segmentContainerStyle}>
          {(Object.keys(categoryLabels) as KeywordCategory[]).map((cat) => (
            <button
              key={cat}
              style={getSegmentStyle(category === cat)}
              onClick={() => setCategory(cat)}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* iOS: Action buttons - "키워드 추가 +" and "삭제" */}
        <div style={actionButtonsStyle}>
          <button
            style={actionButtonStyle}
            onClick={() => setShowAddModal(true)}
          >
            키워드 추가 +
          </button>
          {!isDeleteMode ? (
            <button
              style={actionButtonStyle}
              onClick={() => setIsDeleteMode(true)}
            >
              삭제
            </button>
          ) : (
            <>
              <button
                style={actionButtonStyle}
                onClick={() => {
                  setIsDeleteMode(false);
                  setKeywordsToDelete(new Set());
                }}
              >
                취소
              </button>
              <button
                style={{ ...actionButtonStyle, color: keywordsToDelete.size > 0 ? colors.semantic.error : colors.neutral[400] }}
                onClick={handleDeleteKeywords}
                disabled={keywordsToDelete.size === 0}
              >
                삭제
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Delete mode notice */}
          {isDeleteMode && (
            <div style={{ marginBottom: 12 }}>
              <TDLabel
                text="· 삭제 할 키워드를 선택해주세요"
                font="boldBody2"
                color={colors.semantic.error}
              />
            </div>
          )}

          {/* iOS: Keywords grouped by category with section headers */}
          {isLoading ? (
            <div style={emptyStateStyle}>
              <TDLabel text="키워드를 불러오는 중..." font="mediumBody2" color={colors.neutral[500]} />
            </div>
          ) : (
            <>
              {categoriesToDisplay.map((cat) => {
                const categoryKeywords = getKeywordsByCategory(cat);
                if (categoryKeywords.length === 0) return null;

                return (
                  <div key={cat}>
                    {/* Section Header with icon */}
                    <div style={sectionHeaderStyle}>
                      <img
                        src={categoryIcons[cat]}
                        alt=""
                        style={{
                          ...sectionIconStyle,
                          // iOS: RESULT category heart icon uses neutral300 tint (grayscale)
                          ...(cat === 'RESULT' && {
                            filter: 'grayscale(100%) brightness(1.2)',
                            opacity: 0.5,
                          }),
                        }}
                      />
                      <span style={sectionLabelStyle}>{categoryLabels[cat]}</span>
                    </div>

                    {/* Keywords grid */}
                    <div style={keywordGridStyle}>
                      {categoryKeywords.map((keyword) => {
                        const isSelected = isDeleteMode
                          ? keywordsToDelete.has(keyword.id)
                          : localSelectedKeywords.some((k) => k.id === keyword.id);
                        return (
                          <button
                            key={keyword.id}
                            style={getKeywordChipStyle(isSelected)}
                            onClick={() => handleToggleKeyword(keyword)}
                          >
                            {keyword.content}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Empty state if no keywords */}
              {categoriesToDisplay.every(cat => getKeywordsByCategory(cat).length === 0) && (
                <div style={emptyStateStyle}>
                  <TDLabel text="아직 키워드가 없어요" font="mediumBody2" color={colors.neutral[500]} />
                  <TDLabel text="키워드를 추가해보세요!" font="regularCaption1" color={colors.neutral[400]} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - iOS style with 취소/저장 buttons */}
        <div style={footerStyle}>
          <button style={cancelButtonStyle} onClick={onClose}>
            취소
          </button>
          <button style={saveButtonStyle} onClick={handleDone}>
            저장
          </button>
        </div>
      </div>

      {/* KeywordAddModal - wider version */}
      {showAddModal && (
        <KeywordAddModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddKeyword}
          wider
        />
      )}
    </div>
  );
};
