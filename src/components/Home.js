// components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import styles from './Home.module.css';

const Home = () => {
    const navigate = useNavigate();

    const handleDonateClick = () => {
        navigate('/map');
    };

    const handleShopClick = () => {
        navigate('/shop');
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.log('Error signing out:', error);
        }
    };

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.navLogo}>Fabric Donation App</div>
                <div className={styles.navLinks}>
                    <button onClick={handleSignOut} className={styles.navButton}>Sign Out</button>
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
