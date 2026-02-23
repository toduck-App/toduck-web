import React, { useState, useEffect, useMemo } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TDLabel } from '../common/TDLabel';
import { TDButton } from '../common/TDButton';
import { DiaryKeyword } from '../../types';
import { diaryService } from '../../services/diaryService';
import { KeywordAddModal } from './KeywordAddModal';

// Book keyword images based on category count
import bookKeywordNone from '../../assets/images/diary/keyword/bookKeywordNone.png';
import bookKeywordOne from '../../assets/images/diary/keyword/bookKeywordOne.png';
import bookKeywordTwo from '../../assets/images/diary/keyword/bookKeywordTwo.png';
import bookKeywordThree from '../../assets/images/diary/keyword/bookKeywordThree.png';
import bookKeywordFour from '../../assets/images/diary/keyword/bookKeywordFour.png';

// Category icons
import iconPeople from '../../assets/images/diary/keyword/people.png';
import iconPlace from '../../assets/images/diary/keyword/place.png';
import iconTalk from '../../assets/images/diary/keyword/talk.png';
import iconHeart from '../../assets/images/diary/keyword/heart.png';

interface DiaryKeywordStepProps {
  selectedKeywords: DiaryKeyword[];
  onNext: (keywords: DiaryKeyword[]) => void;
  onSkip: () => void;
}

// iOS categories from API - order: 전체, 사람, 장소, 상황, 결과
type KeywordCategory = 'all' | 'PERSON' | 'PLACE' | 'SITUATION' | 'RESULT';

const categoryOrder: KeywordCategory[] = ['all', 'PERSON', 'PLACE', 'SITUATION', 'RESULT'];

const categoryLabels: Record<KeywordCategory, string> = {
  all: '전체',
  PERSON: '사람',
  PLACE: '장소',
  SITUATION: '상황',
  RESULT: '결과 / 느낌',
};

const categoryIcons: Record<Exclude<KeywordCategory, 'all'>, string> = {
  PERSON: iconPeople,
  PLACE: iconPlace,
  SITUATION: iconTalk,
  RESULT: iconHeart,
};

type Mode = 'normal' | 'delete';

export const DiaryKeywordStep: React.FC<DiaryKeywordStepProps> = ({
  selectedKeywords: initialKeywords,
  onNext,
  onSkip,
}) => {
  const [mode, setMode] = useState<Mode>('normal');
  const [selectedKeywords, setSelectedKeywords] = useState<DiaryKeyword[]>(initialKeywords);
  const [keywordsToDelete, setKeywordsToDelete] = useState<DiaryKeyword[]>([]);
  const [allKeywords, setAllKeywords] = useState<DiaryKeyword[]>([]);
  const [category, setCategory] = useState<KeywordCategory>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchKeywords();
  }, []);

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

  // Filter keywords by category
  const filteredKeywords = useMemo(() => {
    if (category === 'all') return allKeywords;
    return allKeywords.filter((k) => k.category === category);
  }, [allKeywords, category]);

  // Get book image based on unique category count of selected keywords
  const getBookImage = () => {
    const categoryCount = new Set(selectedKeywords.map((k) => k.category)).size;
    switch (categoryCount) {
      case 1: return bookKeywordOne;
      case 2: return bookKeywordTwo;
      case 3: return bookKeywordThree;
      case 4: return bookKeywordFour;
      default: return bookKeywordNone;
    }
  };

  const handleKeywordClick = (keyword: DiaryKeyword) => {
    if (mode === 'normal') {
      // Toggle selection
      const isSelected = selectedKeywords.some((k) => k.id === keyword.id);
      if (isSelected) {
        setSelectedKeywords((prev) => prev.filter((k) => k.id !== keyword.id));
      } else {
        setSelectedKeywords((prev) => [...prev, keyword]);
      }
    } else {
      // Toggle delete selection
      const isSelectedForDelete = keywordsToDelete.some((k) => k.id === keyword.id);
      if (isSelectedForDelete) {
        setKeywordsToDelete((prev) => prev.filter((k) => k.id !== keyword.id));
      } else {
        setKeywordsToDelete((prev) => [...prev, keyword]);
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedKeywords([]);
  };

  const handleEnterDeleteMode = () => {
    setMode('delete');
    setKeywordsToDelete([]);
  };

  const handleCancelDeleteMode = () => {
    setMode('normal');
    setKeywordsToDelete([]);
  };

  const handleDeleteKeywords = async () => {
    try {
      // Delete all selected keywords
      await Promise.all(
        keywordsToDelete.map((keyword) =>
          diaryService.deleteKeyword(keyword.content, keyword.category || 'CUSTOM')
        )
      );

      // Remove from allKeywords
      setAllKeywords((prev) =>
        prev.filter((k) => !keywordsToDelete.some((dk) => dk.id === k.id))
      );

      // Remove from selectedKeywords
      setSelectedKeywords((prev) =>
        prev.filter((k) => !keywordsToDelete.some((dk) => dk.id === k.id))
      );

      setMode('normal');
      setKeywordsToDelete([]);
    } catch (error) {
      console.error('Failed to delete keywords:', error);
    }
  };

  const handleAddKeyword = async (name: string, categoryValue: string) => {
    try {
      await diaryService.createKeyword(name, categoryValue);
      setShowAddModal(false);
      // 키워드 리스트 새로고침
      await fetchKeywords();
    } catch (error) {
      console.error('Failed to create keyword:', error);
    }
  };

  const handleNext = () => {
    onNext(selectedKeywords);
  };

  // ===== STYLES =====

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '0 16px 28px',
    backgroundColor: colors.baseWhite,
  };

  // iOS: Label stack top 42pt
  const headerContainerStyle: React.CSSProperties = {
    paddingTop: 42,
    textAlign: 'center',
  };

  // iOS: Book image 240×240, right below header
  const bookContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    cursor: mode === 'normal' ? 'pointer' : 'default',
    opacity: mode === 'delete' ? 0.3 : 1,
  };

  const bookImageStyle: React.CSSProperties = {
    width: 240,
    height: 240,
    objectFit: 'contain',
  };

  // iOS: Selected keywords below book, height 70pt, inset 50pt
  const selectedKeywordsContainerStyle: React.CSSProperties = {
    minHeight: 70,
    padding: '0 34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: mode === 'delete' ? 0.3 : 1,
  };

  const selectedKeywordsScrollStyle: React.CSSProperties = {
    display: 'flex',
    gap: 4,
    overflowX: 'auto',
    overflowY: 'hidden',
    width: '100%',
    justifyContent: selectedKeywords.length === 0 ? 'center' : 'flex-start',
  };

  // iOS: Keyword chip - white bg, neutral300 border, 8pt radius, 32pt height
  const selectedChipStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: colors.baseWhite,
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 8,
    height: 32,
    fontSize: typography.mediumBody2.fontSize,
    color: colors.neutral[700],
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  // iOS: Segment control - 56pt below book, bottom line indicator
  const segmentContainerStyle: React.CSSProperties = {
    marginTop: 56,
    marginBottom: 12,
  };

  const segmentStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: `2px solid ${colors.baseWhite}`,
    position: 'relative',
  };

  const getSegmentButtonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px 0',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: `2px solid ${isActive ? colors.neutral[800] : 'transparent'}`,
    marginBottom: -2,
    cursor: 'pointer',
    fontSize: typography.boldHeader5.fontSize,
    fontWeight: typography.boldHeader5.fontWeight,
    color: isActive ? colors.neutral[800] : colors.neutral[500],
    transition: 'all 0.2s ease',
  });

  // iOS: Button row - 12pt below segment, 32pt height, 8pt spacing
  const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  };

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
    color: colors.neutral[700],
  };

  // iOS: Delete mode label
  const deleteModeInfoStyle: React.CSSProperties = {
    fontSize: typography.boldBody2.fontSize,
    fontWeight: typography.boldBody2.fontWeight,
    color: colors.semantic.error,
    marginBottom: 16,
  };

  // iOS: Collection view - line spacing 12pt, item spacing 8pt
  const keywordsGridStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    marginBottom: 16,
  };

  const keywordsListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 32,
  };

  // iOS: Keyword cell
  const getKeywordButtonStyle = (isSelected: boolean, isSelectedForDelete: boolean): React.CSSProperties => {
    if (mode === 'delete') {
      if (isSelectedForDelete) {
        return {
          padding: '6px 12px',
          backgroundColor: colors.baseWhite,
          border: `1px solid ${colors.semantic.error}`,
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: typography.mediumBody2.fontSize,
          color: colors.semantic.error,
        };
      }
      return {
        padding: '6px 12px',
        backgroundColor: colors.neutral[100],
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: typography.mediumBody2.fontSize,
        color: colors.neutral[700],
      };
    }

    // Normal mode
    return {
      padding: '6px 12px',
      backgroundColor: isSelected ? colors.primary[100] : colors.neutral[100],
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: typography.mediumBody2.fontSize,
      color: isSelected ? colors.primary[500] : colors.neutral[700],
    };
  };

  // iOS: Category section title container style
  const getCategorySectionTitleContainerStyle = (isFirst: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    marginTop: isFirst ? 0 : 16,
  });

  // iOS: Category section title icon style
  const getCategoryIconStyle = (cat: string): React.CSSProperties => ({
    width: 16,
    height: 16,
    ...(cat === 'RESULT' && {
      filter: 'grayscale(100%) brightness(1.2)',
      opacity: 0.5,
    }),
  });

  // iOS: Category section title text style
  const categorySectionTitleTextStyle: React.CSSProperties = {
    fontSize: typography.boldCaption1.fontSize,
    fontWeight: typography.boldCaption1.fontWeight,
    color: colors.neutral[500],
  };

  // iOS: Category section container
  const categorySectionStyle: React.CSSProperties = {
    width: '100%',
  };

  // iOS: Keywords in section
  const categoryKeywordsStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  };

  // Group keywords by category
  const groupedKeywords = useMemo(() => {
    if (category !== 'all') {
      return { [category]: filteredKeywords };
    }
    // Group by category for 'all' tab
    const groups: Record<string, typeof filteredKeywords> = {};
    const orderWithoutAll = categoryOrder.filter(c => c !== 'all') as string[];

    orderWithoutAll.forEach(cat => {
      const keywords = allKeywords.filter(k => k.category === cat);
      if (keywords.length > 0) {
        groups[cat] = keywords;
      }
    });
    return groups;
  }, [category, filteredKeywords, allKeywords]);

  // iOS: Button stack - 56pt height, 10pt spacing
  const footerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 10,
    marginTop: 'auto',
  };

  const emptyStateStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.neutral[500],
    paddingTop: 16,
  };

  // Get title and description based on mode
  const getTitle = () => mode === 'normal'
    ? '하루를 키워드로 정리해 볼까요?'
    : '삭제 할 키워드를 선택해주세요';

  const getDescription = () => mode === 'normal'
    ? '책을 꾹 누르면 선택 키워드가 초기화 돼요'
    : '필요없는 키워드를 삭제해요';

  return (
    <div style={containerStyle}>
      {/* Header - changes based on mode */}
      <div style={headerContainerStyle}>
        <TDLabel
          text={getTitle()}
          font="boldHeader4"
          color={colors.neutral[800]}
          style={{ display: 'block', marginBottom: 8 }}
        />
        <TDLabel
          text={getDescription()}
          font="boldBody2"
          color={colors.neutral[600]}
        />
      </div>

      {/* Book Image - 240×240, click to clear */}
      <div
        style={bookContainerStyle}
        onClick={mode === 'normal' ? handleClearSelection : undefined}
      >
        <img src={getBookImage()} alt="Keyword book" style={bookImageStyle} />
      </div>

      {/* Selected Keywords - below book */}
      <div style={selectedKeywordsContainerStyle}>
        <div style={selectedKeywordsScrollStyle}>
          {selectedKeywords.length === 0 ? (
            <TDLabel
              text="키워드를 선택해 주세요"
              font="boldBody1"
              color={colors.neutral[600]}
            />
          ) : (
            selectedKeywords.map((keyword) => (
              <div key={keyword.id} style={selectedChipStyle}>
                {keyword.content}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Segment Control - iOS style with bottom line */}
      <div style={segmentContainerStyle}>
        <div style={segmentStyle}>
          {categoryOrder.map((cat) => (
            <button
              key={cat}
              style={getSegmentButtonStyle(category === cat)}
              onClick={() => setCategory(cat)}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Action Row or Delete Mode Label */}
      {mode === 'normal' ? (
        <div style={buttonRowStyle}>
          <button style={actionButtonStyle} onClick={() => setShowAddModal(true)}>
            키워드 추가 +
          </button>
          <button style={actionButtonStyle} onClick={handleEnterDeleteMode}>
            삭제
          </button>
        </div>
      ) : (
        <div style={deleteModeInfoStyle}>
          · 삭제 할 키워드를 선택해주세요
        </div>
      )}

      {/* Keywords List */}
      <div style={keywordsGridStyle}>
        {isLoading ? (
          <div style={emptyStateStyle}>
            <TDLabel text="키워드를 불러오는 중..." font="mediumBody2" color={colors.neutral[500]} />
          </div>
        ) : filteredKeywords.length === 0 ? (
          <div style={emptyStateStyle}>
            <TDLabel text="아직 키워드가 없어요" font="mediumBody2" color={colors.neutral[500]} />
            <TDLabel text="키워드를 추가해보세요!" font="regularCaption1" color={colors.neutral[400]} />
          </div>
        ) : (
          <div style={keywordsListStyle}>
            {Object.entries(groupedKeywords).map(([cat, keywords], index) => (
              <div key={cat} style={categorySectionStyle}>
                <div style={getCategorySectionTitleContainerStyle(index === 0)}>
                  {cat !== 'all' && (
                    <img
                      src={categoryIcons[cat as Exclude<KeywordCategory, 'all'>]}
                      alt=""
                      style={getCategoryIconStyle(cat)}
                    />
                  )}
                  <span style={categorySectionTitleTextStyle}>
                    {categoryLabels[cat as KeywordCategory]}
                  </span>
                </div>
                <div style={categoryKeywordsStyle}>
                  {keywords.map((keyword) => {
                    const isSelected = selectedKeywords.some((k) => k.id === keyword.id);
                    const isSelectedForDelete = keywordsToDelete.some((k) => k.id === keyword.id);
                    return (
                      <button
                        key={keyword.id}
                        style={getKeywordButtonStyle(isSelected, isSelectedForDelete)}
                        onClick={() => handleKeywordClick(keyword)}
                      >
                        {keyword.content}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - changes based on mode */}
      <div style={footerStyle}>
        {mode === 'normal' ? (
          <>
            <TDButton
              title="건너뛰기"
              variant="outline"
              onClick={onSkip}
              style={{ flex: 1, height: 56 }}
            />
            <TDButton
              title="저장"
              onClick={handleNext}
              style={{ flex: 2, height: 56 }}
            />
          </>
        ) : (
          <>
            <TDButton
              title="취소"
              variant="outline"
              onClick={handleCancelDeleteMode}
              style={{ flex: 1, height: 56 }}
            />
            <TDButton
              title="삭제"
              onClick={handleDeleteKeywords}
              disabled={keywordsToDelete.length === 0}
              style={{
                flex: 2,
                height: 56,
                ...(keywordsToDelete.length > 0 && { backgroundColor: colors.semantic.error }),
              }}
            />
          </>
        )}
      </div>

      {/* Keyword Add Modal */}
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
