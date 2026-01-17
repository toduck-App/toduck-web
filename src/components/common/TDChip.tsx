import React from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { layout } from '../../styles/layout';

interface ChipItem {
  id: string;
  label: string;
}

interface TDChipProps {
  item: ChipItem;
  isSelected: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

export const TDChip: React.FC<TDChipProps> = ({
  item,
  isSelected,
  onClick,
  style,
}) => {
  const chipStyle: React.CSSProperties = {
    height: layout.social.chipHeight,
    padding: '0 14px',
    backgroundColor: isSelected ? colors.primary[500] : colors.baseWhite,
    color: isSelected ? colors.baseWhite : colors.neutral[700],
    borderRadius: layout.social.chipCornerRadius,
    border: isSelected ? 'none' : `1px solid ${colors.neutral[300]}`,
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    letterSpacing: typography.mediumBody2.letterSpacing,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  return (
    <button onClick={onClick} style={chipStyle}>
      {item.label}
    </button>
  );
};

// Chip Collection View
interface TDChipCollectionProps {
  items: ChipItem[];
  selectedId: string | null;
  onChange: (id: string) => void;
  style?: React.CSSProperties;
}

export const TDChipCollection: React.FC<TDChipCollectionProps> = ({
  items,
  selectedId,
  onChange,
  style,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 4,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    ...style,
  };

  return (
    <div style={containerStyle} className="hide-scrollbar">
      {items.map((item) => (
        <TDChip
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          onClick={() => onChange(item.id)}
        />
      ))}
    </div>
  );
};
