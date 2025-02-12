import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import lightStyles from '../styles/modules/Sidebar.module.css';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBurgerButton, setShowBurgerButton] = useState(true);
  const [theme] = useState<'light' | 'dark'>(() => {
    // Load theme preference from localStorage or default to 'light'
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // Use the appropriate styles based on the current theme
  const styles = theme === 'dark' ? lightStyles : lightStyles;
  let lastScrollPosition = 0;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };


  const handleScroll = () => {
    const currentScrollPosition = window.scrollY;

    if (currentScrollPosition < lastScrollPosition) {
      // Scrolling up
      setShowBurgerButton(true);
    } else if (currentScrollPosition > lastScrollPosition) {
      // Scrolling down
      setShowBurgerButton(false);
    }

    lastScrollPosition = currentScrollPosition;
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Burger Button */}
      {showBurgerButton && (
        <button
          className={`${styles['burger-button']} ${isOpen ? styles['open'] : ''}`}
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {/* Sidebar */}
      <div className={`${styles['sidebar']} ${isOpen ? styles['open'] : ''}`}>
        <nav>
          <ul>
            <li>
              <Link to="/" onClick={toggleSidebar}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/Documentation" onClick={toggleSidebar}>
                Documentation
              </Link>
            </li>
            <li>
              <Link to="/upload" onClick={toggleSidebar}>
                Upload
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && <div className={styles['overlay']} onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;
