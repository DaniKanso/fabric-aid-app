import React, { useEffect, useState } from 'react';
import Navbar from './navBar';
import { fetchAuthSession } from '@aws-amplify/auth';
import styles from './RewardsPage.module.css';

const RewardsPage = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRewards = async () => {
    try {
        const session = await fetchAuthSession();
        const userEmail = session.tokens.idToken.payload.email;

        const response = await fetch('https://gbey1a7ee9.execute-api.us-east-1.amazonaws.com/pleaseWork/get_rewards');
        const data = await response.json();

        const userRewards = data.filter(reward => reward.user_email === userEmail);

        setRewards(userRewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Navbar />
        <p>Loading rewards...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <h1 className={styles.heading}>Your Rewards</h1>
      {rewards.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((reward, index) => (
              <tr key={index}>
                <td>{reward.store_name}</td>
                <td>{reward.percentage}%</td>
                <td>{reward.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>You have no rewards yet.</p>
      )}
    </div>
  );
};

export default RewardsPage;
