import React from 'react';
import logo1 from '../assets/logo1.jpg'; // Replace with your logo paths
import logo2 from '../assets/logo2.png';
import logo3 from '../assets/logo3.png';

const Header = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo1} alt="Davao City Logo" className="logo" />
        <div className="header-text">
          <h1 className='text-yellow'>Davao: Life is Here</h1>
          <p>Human Resource Management Office, City of Davao</p>
        </div>
        <img src={logo2} alt="Davao Life Logo" className="logo" />
        <img src={logo3} alt="HRMO Logo" className="logo" />
      </div>
    </header>
  );
};

export default Header;