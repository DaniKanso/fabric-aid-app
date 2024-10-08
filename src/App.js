import { getCurrentUser } from 'aws-amplify/auth';
// App.js
import React, { useEffect } from 'react';
import './App.css';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './components/Home';
import MapPage from './components/MapPage';
import ShopMapPage from './components/ShopMapPage';
import EmployeePage from './components/EmployeePage';
import DonationsPage from './components/donationsPage';
import RewardsPage from './components/rewardsPage';
import ForShopsPage from './components/ForShopsPage';



function App() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const user = await getCurrentUser();
                if (user) {
                    navigate('/');
                }
            } catch (err) {
                navigate('/login');
                console.log('User not signed in');
            }
        };
        checkUser();
    }, [navigate]);

    return (
        <div className="App">
            <header className="App-header">
                <h2>Loading...</h2>
            </header>
        </div>
    );
}

function AppWithRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/shop" element={<ShopMapPage />} />
                <Route path="/login" element={<App />} />
                <Route path="/employee" element={<EmployeePage />} />
                <Route path="/donations" element={<DonationsPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/shops" element={<ForShopsPage />} />
            </Routes>
        </Router>
    );
}

export default withAuthenticator(AppWithRouter);
