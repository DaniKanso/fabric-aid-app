import { getCurrentUser } from 'aws-amplify/auth';
// App.js
import React, { useEffect } from 'react';
import './App.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './components/Home';
import MapPage from './components/MapPage'; // Import MapPage


Amplify.configure(awsconfig);

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
                <Route path="/login" element={<App />} />
            </Routes>
        </Router>
    );
}

export default withAuthenticator(AppWithRouter);
