import React, { useEffect, useState } from 'react';
import styles from './RewardsPage.module.css';
import Navbar from './navBar';

const RewardsPage = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch('https://gbey1a7ee9.execute-api.us-east-1.amazonaws.com/pleaseWork/get_rewards');
        const data = await response.json();
        setRewards(data);
      } catch (error) {
        console.error("Error fetching rewards:", error);
        setError("Failed to fetch rewards. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

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

  if (error) {
    return <p>{error}</p>;
  }

  if (rewards.length === 0) {
    return <p>No rewards available at the moment.</p>;
  }

  return (
    <div className={styles.container}>
    <Navbar />
      <h1>Rewards</h1>
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
    </div>
  );
};

export default RewardsPage;
