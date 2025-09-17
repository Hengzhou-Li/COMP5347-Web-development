import React from 'react';

import { useNavigate } from 'react-router-dom';

function PhoneCard({ phone, size = 'normal', mode = 'full' }) {
  const isSmall = size === 'small';
  const navigate = useNavigate(); // 新增 跳转商品信息页面

  const sellerName = phone.seller && phone.seller.firstname
    ? `${phone.seller.firstname} ${phone.seller.lastname}`
    : 'Unknown';

  const averageRating = phone.reviews && phone.reviews.length > 0
    ? (
        phone.reviews.reduce((sum, review) => sum + review.rating, 0) / phone.reviews.length
      ).toFixed(1)
    : 'No ratings';

  const cardStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: isSmall ? '10px' : '16px',
    margin: '8px',
    width: isSmall ? '200px' : '280px',
    fontSize: isSmall ? '14px' : '16px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
  };

  const imageStyle = {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '8px'
  };

  return (
    <div className="phone-card" style={cardStyle} className="phone-card"
            style={{ ...cardStyle, cursor: 'pointer' }}  // 鼠标悬停显示手型
            onClick={() => navigate(`/phone/${phone._id}`)}  // 点击跳转
    >
      <img src={`/dataset_dev/phone_default_images/${phone.brand}.jpeg`} alt={phone.brand} style={imageStyle} />

      <h3
        title={phone.title}
        style={{
          margin: '8px 0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block',
          width: '100%',
          fontWeight: 'bold'
        }}
      >
        {phone.title}
      </h3>

      {/* Always show price */}
      <p><strong>Price:</strong> ${phone.price}</p>

      {/* Show brand, stock, seller only in full mode */}
      {mode === 'full' && (
        <>
          <p><strong>Brand:</strong> {phone.brand}</p>
          <p><strong>Stock:</strong> {phone.stock}</p>
          <p><strong>Seller:</strong> {sellerName}</p>
          <p><strong>Rating:</strong> {averageRating} <span style={{ color: 'gold' }}>⭐</span></p>
        </>
      )}

      {/* Show rating only in bestseller mode */}
      {mode === 'bestseller' && (
        <p><strong>Rating:</strong> {averageRating} <span style={{ color: 'gold' }}>⭐</span></p>
      )}

      {/* soldoutsoon 模式只显示 title 和 price，什么也不显示 */}
    </div>
  );
}

export default PhoneCard;