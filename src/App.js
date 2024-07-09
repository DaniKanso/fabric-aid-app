import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Amplify} from 'aws-amplify';
import awsconfig from './aws-exports';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { withAuthenticator, Authenticator, Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './components/Home';

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
                console.log('User not signed in');
            }
        };
        checkUser();
    }, [navigate]);

    return (
        <div className="App">
            <header className="App-header">
                <Authenticator>
                    {({ signOut, user }) => (
                        <>
                            <Button onClick={signOut}>Sign out</Button>
                            <h2>Welcome, {user.username}</h2>
                        </>
                    )}
                </Authenticator>
                <h2>My App Content</h2>
            </header>
        </div>
    );
}

function AppWithRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/app" element={<App />} />
            </Routes>
        </Router>
    );
}

export default withAuthenticator(AppWithRouter);