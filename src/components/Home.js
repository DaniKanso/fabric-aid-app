import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
    const navigate = useNavigate();

    const handleDonateClick = () => {
        // Navigate to the donate page
        navigate('/donate');
    };

    const handleShopClick = () => {
        // Navigate to the shop page
        navigate('/shop');
    };

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.navLogo}>Fabric Donation App</div>
                <div className={styles.navLinks}>
                    <button onClick={handleDonateClick} className={styles.navButton}>Donate</button>
                    <button onClick={handleShopClick} className={styles.navButton}>Shop</button>
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
