// components/MapPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MapComponent from './MapComponent';
import styles from './MapPage.module.css';

const MapPage = () => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className={styles.mapPageContainer}>
            <button onClick={handleBackClick} className={styles.backButton}>Back</button>
            <MapComponent />
        </div>
    );
};

export default MapPage;
