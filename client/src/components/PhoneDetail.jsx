import React, { useEffect, useState, useContext } from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

import TopBar from './TopBar';

function PhoneDetail() {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext); // 获取token和用户信息
  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [visibleCount, setVisibleCount] = useState(3);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [maxPrice, setMaxPrice] = useState(null);
  const location = useLocation();
  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  // 新增评论相关状态
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [quantity, setQuantity] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/phones/${id}`);
        setPhone(res.data);
      } catch (err) {
        setError('Failed to load phone details.');
      } finally {
        setLoading(false);
      }
    };

    const checkWishlistStatus = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `http://localhost:5000/api/wishlist/${user.id}/contains/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(res);
        setIsWishlisted(res.data.isWishlisted); // true or false from backend
      } catch (err) {
        console.error('Failed to check wishlist status', err);
      }
    };

    fetchPhone();
    checkWishlistStatus();
  }, [id, user]);

  const addToCart = async () => {
    console.log(user)
    const isConfirmed = window.confirm('Are you sure you want to add to cart?');
    if (!isConfirmed) return;

    if (!user) {
      alert('Please login to add items to cart.');
      navigate('/login', {
        state: { from: location.pathname },
        replace: true,
      });
      return;
    }

    // 验证商品库存
    if (quantity > phone.stock) {
      alert(`Only ${phone.stock} items available in stock`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/cart/${user.id}/add`,
        { phoneId: id, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message) {
        alert('Item added to cart successfully!');
        // 可选：更新全局购物车状态或数量显示
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error
        || 'Failed to add item to cart. Please try again.';
      alert(errorMessage);
    }
  };

  const [isWishlisted, setIsWishlisted] = useState(false);

  const addToWishlist = async () => {
    console.log(user)
    const isConfirmed = window.confirm('Are you sure you want to add to wishlist?');
    if (!isConfirmed) return;

    if (!user) {
      alert('Please login to add items to wishlist.');
      navigate('/login', {
        state: { from: location.pathname },
        replace: true,
      });
      return;
    }

    // 验证商品库存
    if (quantity > phone.stock) {
      alert(`Only ${phone.stock} items available in stock`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/wishlist/${user.id}/add`,
        { phoneId: id, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message) {
        alert('Item added to wishlist successfully!');
        setIsWishlisted(true); // 设置为 true
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error
        || 'Failed to add item to wishlist. Please try again.';
      alert(errorMessage);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      console.log(itemId)
      await axios.delete(`http://localhost:5000/api/wishlist/${user.id}/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsWishlisted(false);
    } catch (err) {
      console.error('Failed to remove item:', err);
      alert('Failed to remove item');
    }
  }

  // 新增数量选择器
  const QuantitySelector = () => (
    <div>
      <label>Quantity: </label>
      <input
        type="number"
        min="1"
        max={phone?.stock || 1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Math.min(phone.stock, e.target.value)))}
      />
    </div>
  );

  // 提交评论
  const handleSubmitReview = async () => {
    if (!token) {
      setSubmitError('You must be logged in to submit a review.');
      return;
    }
    if (!comment.trim()) {
      setSubmitError('Comment cannot be empty.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setSubmitError('Rating must be between 1 and 5.');
      return;
    }

    try {
      setSubmitError('');
      await axios.post(
        `http://localhost:5000/api/phones/${id}/reviews`,
        { reviewer: user.id, comment, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitSuccess('Review submitted!');
      setComment('');
      setRating(5);
      // 刷新评论列表
      const res = await axios.get(`http://localhost:5000/api/phones/${id}`);
      setPhone(res.data);
    } catch (err) {
      setSubmitError('Failed to submit review.');
    }
  };

  if (loading) return <div>Loading phone details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!phone) return <div>No phone found.</div>;

  const visibleReviews = phone.reviews
    ? phone.reviews.filter(review =>
        review.hidden !== "true" || (user && (review.reviewer === user.id || review.reviewer?._id === user.id))
      ).slice(0, visibleCount)
    : [];



  return (
      <div>
        <TopBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            handleSearch={handleSearch}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
        />
        <h1>{phone.title}</h1>
        <p><strong>Brand:</strong> {phone.brand}</p>
        <p><strong>Stock:</strong> {phone.stock}</p>
        <p><strong>Seller:</strong> {phone.seller ? `${phone.seller.firstname} ${phone.seller.lastname}` : 'Unknown'}
        </p>
        <p><strong>Price:</strong> ${phone.price}</p>
        <img src={`/dataset_dev/phone_default_images/${phone.brand}.jpeg`} alt={phone.brand}/>
        <hr/>

        {/* 添加数量选择器 */}
        <QuantitySelector/>

        <button type="button" onClick={addToCart}>Add to cart</button>
        {isWishlisted ? <button type="button" onClick={() => removeFromWishlist(id)}>Remove from wishlist</button>
            : <button type="button" onClick={addToWishlist}>Add to wishlist</button>}


        {isWishlisted && (
            <p style={{color: 'green', marginTop: '10px'}}>
              🤍🤍🤍This item is in your Wishlist🤍🤍🤍
            </p>
        )}


        <h3>Leave a Review</h3>
        {user ? (
            <>
          <textarea
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write your review here..."
              style={{width: '100%'}}
          />
              <br/>
              <label>
                Rating:{' '}
                <select value={rating} onChange={e => setRating(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <br/>
              <button onClick={handleSubmitReview}>Submit Review</button>
              {submitError && <p style={{color: 'red'}}>{submitError}</p>}
              {submitSuccess && <p style={{color: 'green'}}>{submitSuccess}</p>}
            </>
        ) : (
            <p>Please log in to leave a review.</p>
        )}

      <h3>Comments</h3>
      {phone.reviews && phone.reviews.length > 0 ? (
        <>
          <ul>
            {visibleReviews.map((review, index) => (
              <ReviewItem key={index} review={review} phoneId={phone._id} />
            ))}
          </ul>
          {visibleCount < phone.reviews.length && (
            <button onClick={() => setVisibleCount(visibleCount + 3)}>Show More</button>
          )}
        </>
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
}

function ReviewItem({ review, phoneId, onToggleHidden }) {
  const [expanded, setExpanded] = useState(false);
  const { user, token } = useContext(AuthContext);

  const [localHidden, setLocalHidden] = useState(review.hidden === 'true');

  const maxWords = 200;
  const words = review.comment.trim().split(/\s+/);
  const isLong = words.length > maxWords;

  const displayedText = expanded
    ? review.comment
    : words.slice(0, maxWords).join(' ') + (isLong ? '...' : '');

  const toggleHidden = async () => {
    try {
      const newHidden = !localHidden;

      await axios.put(
        `http://localhost:5000/api/reviews/${phoneId}/${review.reviewer._id || review.reviewer}/hidden`,
        { hidden: newHidden ? 'true' : 'false' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setLocalHidden(newHidden);
      if (onToggleHidden) onToggleHidden();
    } catch (err) {
      alert('Failed to toggle hidden status.');
    }
  };

  const isOwner = user && (review.reviewer._id === user.id || review.reviewer === user.id);

  return (
    <li
      style={{
        marginBottom: '10px',
        color: localHidden ? 'gray' : 'black',
        opacity: localHidden ? 0.5 : 1,
        transition: 'color 0.3s, opacity 0.3s',
      }}
    >
      <p>
        <strong>
          {review.reviewer?.firstname
            ? `${review.reviewer.firstname} ${review.reviewer.lastname} (${review.reviewer.email})`
            : 'Unknown Reviewer'}
        </strong>
        <br />
        {displayedText}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              color: 'blue',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              marginLeft: 5
            }}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
        <br />
        <em>Rating: {review.rating ?? 'N/A'}</em>
        {isOwner && (
          <button onClick={toggleHidden} style={{ marginLeft: '10px' }}>
            {localHidden ? 'Unhide' : 'Hide'}
          </button>
        )}
      </p>
    </li>
  );
}


export default PhoneDetail;








