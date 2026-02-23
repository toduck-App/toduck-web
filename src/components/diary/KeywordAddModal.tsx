import React, { useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TDLabel } from '../common/TDLabel';
import { ChevronDown } from 'lucide-react';

interface KeywordAddModalProps {
  onClose: () => void;
  onAdd: (keyword: string, category: string) => void;
  wider?: boolean; // 더 넓은 모달 (KeywordSheet에서 사용)
}

type Category = 'PERSON' | 'PLACE' | 'SITUATION' | 'RESULT';

const categoryOptions: { value: Category; label: string }[] = [
  { value: 'PERSON', label: '사람' },
  { value: 'PLACE', label: '장소' },
  { value: 'SITUATION', label: '상황' },
  { value: 'RESULT', label: '결과 / 느낌' },
];

export const KeywordAddModal: React.FC<KeywordAddModalProps> = ({
  onClose,
  onAdd,
  wider = false,
}) => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<Category>('PERSON');
  const [showDropdown, setShowDropdown] = useState(false);

  const maxLength = 20;
  const isValid = keyword.trim().length > 0;

  const handleAdd = () => {
    if (isValid) {
      onAdd(keyword.trim(), category);
    }
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setKeyword(value);
    }
  };

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setShowDropdown(false);
  };

  // iOS: Modal overlay
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 24,
  };

  // iOS: Modal container - white bg, 16pt corner radius
  const modalStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
    borderRadius: 16,
    width: '100%',
    maxWidth: wider ? 380 : 320,
    padding: 24,
  };

  // iOS: Title - boldHeader4, centered
  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: 24,
  };

  // iOS: Category dropdown container
  const dropdownContainerStyle: React.CSSProperties = {
    position: 'relative',
    marginBottom: 16,
  };

  // iOS: Dropdown button
  const dropdownButtonStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    padding: '0 16px',
    backgroundColor: colors.neutral[50],
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    fontSize: typography.mediumBody1.fontSize,
    color: colors.neutral[800],
  };

  // iOS: Dropdown menu
  const dropdownMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.baseWhite,
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: 8,
    marginTop: 4,
    zIndex: 10,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  };

  // iOS: Dropdown item
  const getDropdownItemStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '12px 16px',
    backgroundColor: isSelected ? colors.primary[50] : 'transparent',
    cursor: 'pointer',
    fontSize: typography.mediumBody1.fontSize,
    color: isSelected ? colors.primary[500] : colors.neutral[800],
  });

  // iOS: Text input container
  const inputContainerStyle: React.CSSProperties = {
    marginBottom: 24,
  };

  // iOS: Text input
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    padding: '0 16px',
    backgroundColor: colors.neutral[50],
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: 8,
    fontSize: typography.mediumBody1.fontSize,
    color: colors.neutral[800],
    outline: 'none',
    boxSizing: 'border-box',
  };

  // iOS: Character count
  const charCountStyle: React.CSSProperties = {
    textAlign: 'right',
    marginTop: 4,
    fontSize: typography.regularCaption1.fontSize,
    color: colors.neutral[500],
  };

  // iOS: Button row
  const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
  };

  // iOS: Cancel button
  const cancelButtonStyle: React.CSSProperties = {
    flex: 1,
    height: 48,
    backgroundColor: colors.baseWhite,
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: typography.boldBody1.fontSize,
    fontWeight: typography.boldBody1.fontWeight,
    color: colors.neutral[700],
  };

  // iOS: Add button
  const addButtonStyle: React.CSSProperties = {
    flex: 1,
    height: 48,
    backgroundColor: isValid ? colors.primary[500] : colors.neutral[100],
    border: 'none',
    borderRadius: 8,
    cursor: isValid ? 'pointer' : 'not-allowed',
    fontSize: typography.boldBody1.fontSize,
    fontWeight: typography.boldBody1.fontWeight,
    color: isValid ? colors.baseWhite : colors.neutral[500],
  };

  const selectedLabel = categoryOptions.find((c) => c.value === category)?.label || '';

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Title */}
        <div style={titleStyle}>
          <TDLabel
            text="키워드 추가"
            font="boldHeader4"
            color={colors.neutral[800]}
          />
        </div>

        {/* Category Dropdown */}
        <div style={dropdownContainerStyle}>
          <button
            style={dropdownButtonStyle}
            onClick={() => setShowDropdown(!showDropdown)}
            type="button"
          >
            <span>{selectedLabel}</span>
            <ChevronDown
              size={20}
              style={{
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
          {showDropdown && (
            <div style={dropdownMenuStyle}>
              {categoryOptions.map((option) => (
                <div
                  key={option.value}
                  style={getDropdownItemStyle(category === option.value)}
                  onClick={() => handleCategorySelect(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keyword Input */}
        <div style={inputContainerStyle}>
          <input
            type="text"
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="키워드를 입력해주세요"
            style={inputStyle}
            maxLength={maxLength}
          />
          <div style={charCountStyle}>
            {keyword.length}/{maxLength}
          </div>
        </div>

        {/* Buttons */}
        <div style={buttonRowStyle}>
          <button style={cancelButtonStyle} onClick={onClose}>
            취소
          </button>
          <button
            style={addButtonStyle}
            onClick={handleAdd}
            disabled={!isValid}
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
};
