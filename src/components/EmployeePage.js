import React, { useEffect, useState } from 'react';
import styles from './EmployeePage.module.css';
import Navbar from './navBar';

const EmployeePage = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [successMessageVisible, setSuccessMessageVisible] = useState(false);
    const [rejSuccessMessageVisible, setrejSuccessMessageVisible] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedDonationId, setSelectedDonationId] = useState(null);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await fetch('https://gbey1a7ee9.execute-api.us-east-1.amazonaws.com/pleaseWork/get_pending_donations');
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

    const handleAccept = (donationId) => {
        setSelectedDonationId(donationId);
        setShowApproveModal(true);
    };

    const handleModalOptionClick = async (option) => {
        const percentageMap = {
            'Okaz': 15,
            'Second Base': 10,
            'Souk L Khlanj': 25,
        };
        const selectedPercentage = percentageMap[option];

        setShowApproveModal(false);

        try {
            const response = await fetch(`https://gbey1a7ee9.execute-api.us-east-1.amazonaws.com/pleaseWork/donations/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    donationId: selectedDonationId,
                    option: option,
                    percentage: selectedPercentage,
                }),
            });

            if (response.ok) {
                setDonations(donations.filter(donation => donation.id !== selectedDonationId));
                setSuccessMessageVisible(true);
                setTimeout(() => setSuccessMessageVisible(false), 3000);
            } else {
                console.error('Failed to accept donation');
            }
        } catch (error) {
            console.error('Error accepting donation:', error);
        }
    };

    const handleReject = async (donationId) => {
        try {
            const response = await fetch(`https://gbey1a7ee9.execute-api.us-east-1.amazonaws.com/pleaseWork/donations/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    donationId: donationId,
                }),
            });

            if (response.ok) {
                setDonations(donations.filter(donation => donation.id !== donationId));
                setrejSuccessMessageVisible(true);
                setTimeout(() => setrejSuccessMessageVisible(false), 3000);
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
        return (
            <div className={styles.loadingContainer}>
                <Navbar />
                <p>Loading donations...</p>
            </div>
        );
    }
    

    if (donations.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <Navbar />
                <p>No donations to view at the moment.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Navbar />
            <h1>Manage Donations</h1>
            {successMessageVisible && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'green',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    zIndex: 1100,
                    fontSize: '14px',
                }}>
                    Donation Approved Successfully
                </div>
            )}

            {rejSuccessMessageVisible && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'green',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    zIndex: 1100,
                    fontSize: '14px',
                }}>
                    Donation Rejected Successfully
                </div>
            )}

            {showApproveModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Select an Option</h3>
                        <button className={styles.modalButton} onClick={() => handleModalOptionClick('Okaz')}>Okaz (15%)</button>
                        <button className={styles.modalButton} onClick={() => handleModalOptionClick('Second Base')}>Second Base (10%)</button>
                        <button className={styles.modalButton} onClick={() => handleModalOptionClick('Souk L Khlanj')}>Souk L Khlanj (25%)</button>
                        <button className={styles.modalButton} onClick={() => setShowApproveModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

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
                        <th>Bin Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDonations.map((donation) => (
                        <tr key={donation.id}>
                            <td>{donation.code || 'N/A'}</td>
                            <td>{donation.user_email || 'N/A'}</td>
                            <td>{donation.bin_name || 'N/A'}</td>
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
