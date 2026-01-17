import React from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';

export const MainLayout: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.baseWhite,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    paddingTop: layout.navBarHeight,
    paddingBottom: layout.tabBarHeight,
    overflowY: 'auto',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
};
