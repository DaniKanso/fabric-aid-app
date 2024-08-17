// components/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import styles from './Home.module.css';

const Home = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const handleDonateClick = () => {
        navigate('/map');
    };

    const handleShopClick = () => {
        navigate('/shop');
    };

    const handleProfileClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleEmployeeClick = () => {
        navigate('/employee');
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.log('Error signing out:', error);
        }
    };

    const handleDonationsClick = () => {
        navigate('/donations');
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
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.navLogo}>Fabric Donation App</div>
                <div className={styles.navLinks}>
                <div className={styles.profileContainer}>
                    <button onClick={handleProfileClick} className={styles.navButton}>
                        Profile
                    </button>
                    {isDropdownOpen && (
                        <div ref={dropdownRef} className={styles.dropdownMenu}>
                            <button onClick={handleDonationsClick} className={styles.dropdownItem}>
                                Donations
                            </button>
                            <button onClick={handleEmployeeClick} className={styles.dropdownItem}>
                                For Employees
                            </button>
                            <button onClick={handleSignOut} className={styles.dropdownItem}>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
            </nav>
            <main className={styles.mainContent}>
                <h1>Welcome to the Fabric Donation App</h1>
                <p>Select an option below to get started:</p>
                <div className={styles.buttonsContainer}>
                    <button onClick={handleDonateClick} className={styles.mainButton}>Donate</button>
                    <button onClick={handleShopClick} className={styles.mainButton}>Shop</button>
                </div>
            </main>
        </div>
    );
};

export default Home;