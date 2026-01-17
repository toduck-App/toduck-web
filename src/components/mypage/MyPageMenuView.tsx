import React from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { layout } from '../../styles/layout';
import { TDLabel } from '../common/TDLabel';
import { ChevronRight } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  onClick?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MyPageMenuViewProps {
  sections: MenuSection[];
}

export const MyPageMenuView: React.FC<MyPageMenuViewProps> = ({ sections }) => {
  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 8,
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: `${layout.myPage.sectionHeaderHeight / 3}px ${layout.sectionHorizontalInset}px`,
    backgroundColor: colors.neutral[50],
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `14px ${layout.sectionHorizontalInset}px`,
    backgroundColor: colors.baseWhite,
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    borderBottom: `1px solid ${colors.neutral[100]}`,
  };

  return (
    <div style={containerStyle}>
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <TDLabel
              text={section.title}
              font="mediumCaption1"
              color={colors.neutral[600]}
            />
          </div>

          {section.items.map((item) => (
            <button key={item.id} onClick={item.onClick} style={menuItemStyle}>
              <TDLabel
                text={item.label}
                font="mediumHeader5"
                color={colors.neutral[800]}
              />
              <ChevronRight size={20} color={colors.neutral[400]} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};
