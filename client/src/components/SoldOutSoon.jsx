import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PhoneCard from './PhoneCard';

function SoldOutSoon() {
  const [phones, setPhones] = useState([]);
  const [error, setError] = useState(null); // 添加错误状态

  useEffect(() => {
    axios.get('http://localhost:5000/api/phones/soldoutsoon')
      .then(res => setPhones(res.data))
      .catch(err => {
        console.error('Failed to load sold-out-soon phones:', err);
        setError('Unable to fetch data.');
      });
  }, []);

  return (
    <div style={styles.container}>
      <h2>Sold Out Soon</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* 错误提示 */}
      <div style={styles.cardContainer}>
        {phones.length > 0 ? (
          phones.map((phone) => (
            <PhoneCard key={phone._id} phone={phone} mode="soldout" />
          ))
        ) : (
          <p>No low-stock phones found.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    margin: '40px auto',
    padding: '12px 20px',
    border: '1px solid #ccc',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.06)',
    backgroundColor: '#fdfdfd',
    maxWidth: '1120px'
  },
  cardContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '10px'
  }
};

export default SoldOutSoon;
