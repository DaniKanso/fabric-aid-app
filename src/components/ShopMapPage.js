// components/ShopMapPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ShopMapComponent from './ShopMapComponent';
import styles from './MapPage.module.css';

const ShopMapPage = () => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className={styles.mapPageContainer}>
            <button onClick={handleBackClick} className={styles.backButton}>Back</button>
            <ShopMapComponent />
        </div>
    );
};

export default ShopMapPage;
