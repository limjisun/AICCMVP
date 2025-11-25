import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type NavItem = {
  icon: 'monitor' | 'list' | 'keyword';
  path: string;
};

const navItems: NavItem[] = [
  { icon: 'monitor', path: '/' },
  { icon: 'list', path: '/consultation' },
  { icon: 'keyword', path: '/keywords' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [indicatorTop, setIndicatorTop] = useState(86);

  // 현재 경로에 맞게 indicator 위치 설정
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path === location.pathname);
    if (currentIndex !== -1) {
      setIndicatorTop(86 + currentIndex * 66);
    }
  }, [location.pathname]);

  const handleNavClick = (path: string, index: number) => {
    navigate(path);
    setIndicatorTop(86 + index * 66); // 86px initial + 66px per item (56px height + 10px gap)
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        <div
          className="sidebar__indicator"
          style={{ top: `${indicatorTop}px` }}
        />
        {navItems.map((item, index) => (
          <button
            key={item.path}
            className={`sidebar__item ${location.pathname === item.path ? 'sidebar__item--active' : ''}`}
            data-icon={item.icon}
            onClick={() => handleNavClick(item.path, index)}
          >
            <div className="sidebar__icon" data-icon={item.icon} />
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
