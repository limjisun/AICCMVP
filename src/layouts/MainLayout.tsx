import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <>
      <Header />
      <div className="container">
        <Sidebar />
        <main className="main">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default MainLayout;
