import React, { useEffect, useState } from 'react';
import styles from './EmployeePage.module.css'; // Custom CSS

const EmployeePage = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await fetch('https://gbey1a7ee9.execute-api.us-east-1.amazonaws.com/pleaseWork/get_donations'); // Replace with your API endpoint
                const data = await response.json();
                setDonations(data);
            } catch (error) {
                console.error('Error fetching donations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDonations();
    }, []);

    const handleAccept = async (donationId) => {
        try {
            const response = await fetch(`https://your-api-endpoint/donations/${donationId}/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Donation accepted');
                setDonations(donations.filter(donation => donation.id !== donationId));
            } else {
                console.error('Failed to accept donation');
            }
        } catch (error) {
            console.error('Error accepting donation:', error);
        }
    };

    const handleReject = async (donationId) => {
        try {
            const response = await fetch(`https://your-api-endpoint/donations/${donationId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Donation rejected');
                setDonations(donations.filter(donation => donation.id !== donationId));
            } else {
                console.error('Failed to reject donation');
            }
        } catch (error) {
            console.error('Error rejecting donation:', error);
        }
    };

    if (loading) {
        return <p>Loading donations...</p>;
    }

    if (donations.length === 0) {
        return <p>No donations to review at the moment.</p>;
    }

    return (
        <div className={styles.container}>
            <h1>Manage Donations</h1>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Donation Code</th>
                        <th>User ID</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {donations.map((donation) => (
                        <tr key={donation.id}>
                            <td>{donation.donationCode}</td>
                            <td>{donation.userId}</td>
                            <td>
                                <button
                                    className={styles.acceptButton}
                                    onClick={() => handleAccept(donation.id)}
                                >
                                    Accept
                                </button>
                                <button
                                    className={styles.rejectButton}
                                    onClick={() => handleReject(donation.id)}
                                >
                                    Reject
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeePage;
