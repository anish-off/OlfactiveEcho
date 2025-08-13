import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const NavbarWrapper = () => {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register"];
  const hideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
    </>
  );
};

export default NavbarWrapper;