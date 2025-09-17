import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PhoneCard from './PhoneCard';

function BestSellers() {
  const [phones, setPhones] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/phones/bestsellers');
        setPhones(res.data);
      } catch (err) {
        console.error('Failed to fetch best sellers:', err);
        setError('Failed to load best sellers.');
      }
    };

    fetchBestSellers();
  }, []);

  return (
    <div style={styles.container}>
      <h2>Best Sellers</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={styles.cardContainer}>
        {phones.length > 0 ? (
          phones.map(phone => (
              <>
                <PhoneCard key={phone._id} phone={phone} mode="bestseller" />
              </>
          ))
        ) : (
          <p>No best sellers found.</p>
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

export default BestSellers;