import React, { useEffect, useState } from 'react';
import styles from './EmployeePage.module.css'; // Custom CSS

const EmployeePage = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await fetch('https://gbey1a7ee9.execute-api.us-east-1.amazonaws.com/pleaseWork/get_donations');
                const data = await response.json();
                console.log(data);
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
            console.log(JSON.stringify({ donationId: donationId, }));
            const response = await fetch(`https://gbey1a7ee9.execute-api.us-east-1.amazonaws.com/pleaseWork/donations/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    donationId: donationId,
                }),
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

    const filteredDonations = donations.filter(donation =>
        donation.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <p>Loading donations...</p>;
    }

    if (donations.length === 0) {
        return <p>No donations to review at the moment.</p>;
    }

    return (
        <div className={styles.container}>
            <h1>Manage Donations</h1>
                <input
                    type="text"
                    placeholder="Search Donation Code"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Donation Code</th>
                        <th>User Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDonations.map((donation) => (
                        <tr key={donation.id}>
                            <td>{donation.code || 'N/A'}</td>
                            <td>{donation.user_email || 'N/A'}</td>
                            <td>
                                <button
                                    className={styles.acceptButton}
                                    onClick={() => handleAccept(donation.id)}
                                >
                                    Approve
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
