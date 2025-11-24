import React from 'react';
import logo from '../assets/images/logo.png';
import iconMy from '../assets/images/icon-my.png';
import iconLogout from '../assets/images/icon-logout.png';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header__logo">
        <img src={logo} alt="Logo" />
      </div>
       <div className="header__user">
            <div className="header__profile">
                <img src={iconMy} alt="Profile"/>
                <span className="header__username">유저Bot</span>
            </div>
            <button className="header__logout">
                <img src={iconLogout} alt="Logout"/>
            </button>
        </div>
    </header>
  );
};

export default Header;
