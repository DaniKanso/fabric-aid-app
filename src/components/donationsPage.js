import React, { useState, useEffect } from 'react';
import { fetchAuthSession } from '@aws-amplify/auth';

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

    return (
        <div>
            <h2>Your Previous Donations</h2>
            {loading ? (
                <p>Loading donations...</p>
            ) : donations.length > 0 ? (
                <ul>
                    {donations.map((donation, index) => (
                        <li key={index}>
                            Code: {donation.code || 'N/A'} Bin: {donation.bin_name || 'N/A'}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You haven't made any donations yet.</p>
            )}
        </div>
    );
};

export default DonationsPage;
