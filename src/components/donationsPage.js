import React, { useState, useEffect } from 'react';
import Navbar from './navBar';
import { fetchAuthSession } from '@aws-amplify/auth';
import styles from './DonationsPage.module.css'; // Assuming you have a CSS file for styling

const DonationsPage = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDonations = async () => {
        try {
            const session = await fetchAuthSession();
            const userEmail = session.tokens.idToken.payload.email;

            const response = await fetch(`https://gbey1a7ee9.execute-api.us-east-1.amazonaws.com/pleaseWork/get_donations`);
            const data = await response.json();

            const userDonations = data.filter(donation => donation.user_email === userEmail);

            setDonations(userDonations);
        } catch (error) {
            console.error('Error fetching donations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Navbar />
                <p>Loading donations...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Navbar />
            <h1 className={styles.heading}>Your Previous Donations</h1>
            {donations.length > 0 ? (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Bin Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.map((donation, index) => (
                            <tr key={index}>
                                <td>{donation.code || 'N/A'}</td>
                                <td>{donation.bin_name || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>You haven't made any donations yet.</p>
            )}
        </div>
    );
};

export default DonationsPage;
