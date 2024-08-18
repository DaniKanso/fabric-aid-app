// components/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import styles from './navBar.module.css';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

    return (
        <nav className={styles.navbar}>
            <div className={styles.navLogo}>Fabric Donation App</div>
            <div className={styles.navLinks}>
            <div className={styles.profileContainer}>
                <button onClick={handleProfileClick} className={styles.navButton}>
                Profile
                </button>
                {isDropdownOpen && (
                <div ref={dropdownRef} className={styles.dropdownMenu}>
                    <button onClick={() => navigate('/')} className={styles.dropdownItem}>Home</button>
                    <button onClick={() => navigate('/rewards')} className={styles.dropdownItem}>Rewards</button>
                    <button onClick={() => navigate('/donations')} className={styles.dropdownItem}>Donations</button>
                    <button onClick={() => navigate('/employee')} className={styles.dropdownItem}>For Employees</button>
                    <button onClick={handleSignOut} className={styles.dropdownItem}>Sign Out</button>
                </div>
                )}
            </div>
            </div>
        </nav>
    );
};

export default Navbar;
