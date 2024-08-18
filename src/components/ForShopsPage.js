import React, { useState, useEffect } from 'react';
import Navbar from './navBar';
import styles from './ForShopsPage.module.css'; 

const ForShopsPage = () => {
    const [selectedStore, setSelectedStore] = useState(null);
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessageVisible, setSuccessMessageVisible] = useState(false);
    const [loadingRewardId, setLoadingRewardId] = useState(null); // New state to track which reward is being redeemed

    const stores = ["Okaz", "Second Base", "Souk L Khlanj"];

    const fetchRewardsForStore = async (store) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('https://gbey1a7ee9.execute-api.us-east-1.amazonaws.com/pleaseWork/get_rewards');
            const data = await response.json();

            const storeRewards = data.filter(reward => reward.store_name === store);

            setRewards(storeRewards);
        } catch (error) {
            console.error("Error fetching rewards:", error);
            setError("Failed to fetch rewards. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleStoreSelection = (store) => {
        setSelectedStore(store);
        fetchRewardsForStore(store);
    };

    const handleRedeem = async (rewardId) => {
        console.log(`Redeeming reward with ID: ${rewardId}`);
        
        setLoadingRewardId(rewardId); // Set the loadingRewardId state to the ID of the reward being redeemed
        
        try {
            const response = await fetch('https://gbey1a7ee9.execute-api.us-east-1.amazonaws.com/pleaseWork/redeem_reward', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rewardId: rewardId }),
            });
        
            console.log(JSON.stringify({ rewardId: rewardId }));

            if (!response.ok) {
                throw new Error('Failed to redeem reward. Please try again later.');
            } else {
                setSuccessMessageVisible(true);
                setTimeout(() => setSuccessMessageVisible(false), 3000);
            }
        
            const result = await response.json();
            console.log('Redeem result:', result);
        
            setRewards(rewards.filter(reward => reward.id !== rewardId));
        } catch (error) {
            console.error("Error redeeming reward:", error);
            setError("Failed to redeem reward. Please try again later.");
        } finally {
            setLoadingRewardId(null); // Reset loadingRewardId when the request is complete
        }
    };

    return (
        <div className={styles.container}>
            <Navbar />
            <h1>For Shops</h1>

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
                    Reward Redeemed Successfully
                </div>
            )}

            {!selectedStore ? (
                <div>
                    <h2>Select a store:</h2>
                    {stores.map((store, index) => (
                        <button
                            key={index}
                            onClick={() => handleStoreSelection(store)}
                            className={styles.storeButton}
                        >
                            {store}
                        </button>
                    ))}
                </div>
            ) : (
                <div>
                    <h2>Rewards for {selectedStore}</h2>

                    {loading ? (
                        <p>Loading rewards...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : rewards.length === 0 ? (
                        <p>No rewards available for {selectedStore}.</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>User Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rewards.map((reward) => (
                                    <tr key={reward.id}>
                                        <td>{reward.user_email}</td>
                                        <td>
                                            <button
                                                onClick={() => handleRedeem(reward.id)}
                                                className={styles.redeemButton}
                                                disabled={loadingRewardId === reward.id} // Disable button while loading
                                            >
                                                {loadingRewardId === reward.id ? (
                                                    <div className={styles.spinner}></div> // Show spinner if loading
                                                ) : (
                                                    'Redeem'
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <button
                        onClick={() => setSelectedStore(null)}
                        className={styles.backButton}
                    >
                        Back to store selection
                    </button>
                </div>
            )}
        </div>
    );
};

export default ForShopsPage;
