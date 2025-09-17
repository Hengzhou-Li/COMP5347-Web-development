import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Profile() {
    const [activeTab, setActiveTab] = useState('editProfile');
    const [user, setUser] = useState(null); // Store user data
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
    });
    const [password, setPassword] = useState(''); // Store current password input
    const [newPassword, setNewPassword] = useState(''); // Store new password input
    const [showPasswordModal, setShowPasswordModal] = useState(false); // Control the visibility of the modal
    const [errorMessage, setErrorMessage] = useState(''); // For displaying error messages
    const { user: currentUser, setUser: setAuthUser, token } = useContext(AuthContext); // Get user info from context

    const [listings, setListings] = useState([]);
    const [newListing, setNewListing] = useState({
        title: '',
        brand: '',
        image: '',
        stock: '',
        price: '',
    });
    const [commentsState, setCommentsState] = useState({});

    useEffect(() => {
        if (currentUser) {
            setUser(currentUser);
            setFormData({
                firstname: currentUser.firstname,
                lastname: currentUser.lastname,
                email: currentUser.email,
            });
        } else if (token) {
            axios
                .post('http://localhost:5000/api/auth/update_profile', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then((response) => {
                    setUser(response.data);
                    setAuthUser(response.data);
                    setFormData({
                        firstname: response.data.firstname,
                        lastname: response.data.lastname,
                        email: response.data.email,
                    });
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error);
                });
        }
    }, [currentUser, token, setAuthUser]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    const handleUpdateProfile = () => {
        // Show modal to ask for password before proceeding
        setShowPasswordModal(true);
    };

    const handleSubmitPassword = () => {
        if (!password) {
            setErrorMessage('Please enter your password.');
            return;
        }

        // Send password with the request to verify before updating profile
        axios
            .post('http://localhost:5000/api/auth/update_profile', { ...formData, password }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                alert('Profile updated successfully!');
                setUser(response.data); // Update the user data after a successful update
                setAuthUser(response.data); // update current login data
                setPassword(''); // Clear the password field after success
                setShowPasswordModal(false); // Close the modal
            })
            .catch((error) => {
                console.error('Error updating profile:', error);
                alert('Failed to update profile.');
                setShowPasswordModal(false); // Close the modal on error
            });
    };

    const handleChangePassword = () => {
        if (!password || !newPassword) {
            alert('Please enter both current and new passwords.');
            return;
        }

        axios
            .post(
                'http://localhost:5000/api/auth/change_password',
                { currentPassword: password, newPassword },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .then((response) => {
                alert('Password changed successfully! An email has been sent to your mailbox.');
                setPassword('');
                setNewPassword('');
                setErrorMessage('');
            })
            .catch((error) => {
                console.error('Error changing password:', error);
                const errorMsg = error.response?.data?.msg || 'Failed to change password.';
                alert(errorMsg);
            });
    };

    // 获取当前用户的列表
    useEffect(() => {
        if (!user?.id) return;

        const fetchUserListings = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setListings(response.data);
                // 初始化评论状态
            } catch (error) {
                console.error('Error fetching listings:', error);
            }
        };
        fetchUserListings();

    }, [user, token]);

    // 新增Listing输入变化处理
    const handleNewListingChange = (e) => {
        setNewListing({
            ...newListing,
            [e.target.name]: e.target.value,
        });
    };

    // 新增Listing提交
    const handleAddListing = async () => {
        const { title, brand, image, stock, price } = newListing;
        if (!title || !brand || !image || !stock || !price) {
            alert('Please fill in all listing details.');
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:5000/api/createlist',
                {
                    title,
                    brand,
                    image,
                    stock: Number(stock),
                    price: Number(price),
                    seller: user.id,
                    reviews: [],
                    enabled: true,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setListings([...listings, response.data]);
            setNewListing({ title: '', brand: '', image: '', stock: '', price: '' });
        } catch (error) {
            console.error('Error adding listing:', error);
            alert('Failed to add listing.');
        }
    };

    // 启用/禁用Listing
    const toggleListingStatus = async (listingId, currentStatus) => {
        try {
            const response = await axios.patch(
                `http://localhost:5000/api/${listingId}`,
                { enabled: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setListings(
                listings.map((listing) =>
                    listing._id === listingId ? { ...listing, enabled: response.data.enabled } : listing
                )
            );
        } catch (error) {
            console.error('Error toggling listing status:', error);
        }
    };

    // 删除Listing
    const deleteListing = async (listingId) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/${listingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setListings(listings.filter((listing) => listing._id !== listingId));
        } catch (error) {
            console.error('Error deleting listing:', error);
            alert('Failed to delete listing.');
        }
    };

    // 切换评论显示/隐藏
    const toggleCommentHidden = async (listingId, reviewerId, currentHidden) => {
      try {
        await axios.put(
          `http://localhost:5000/api/reviews/${listingId}/${reviewerId}/hidden`,
          { hidden: currentHidden ? "false" : "true" }, // 隐藏时设置 "true"，显示时清空 ""
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // 更新本地状态：根据 hidden 是否存在进行切换
        const updatedListings = listings.map((listing) => {
          if (listing._id === listingId) {
            const updatedReviews = listing.reviews.map((review) => {
              if (review.reviewer === reviewerId) {
                const updatedReview = { ...review };
                if (currentHidden) {
                  updatedReview.hidden = "";
                } else {
                  updatedReview.hidden = "true";
                }
                return updatedReview;
              }
              return review;
            });
            return { ...listing, reviews: updatedReviews };
          }
          return listing;
        });

        setListings(updatedListings);
        alert('Review visibility updated successfully!');
      } catch (error) {
        console.error('Error updating comment visibility:', error);
        alert('Failed to update comment visibility on server.');
      }
    };



    const renderTabContent = () => {
        switch (activeTab) {
            case 'editProfile':
                return (
                    <div>
                        <h2>Edit Profile</h2>
                        {user ? (
                            <>
                                <input
                                    type="text"
                                    name="firstname"
                                    placeholder="First Name"
                                    value={formData.firstname}
                                    onChange={handleInputChange}
                                /><br />
                                <input
                                    type="text"
                                    name="lastname"
                                    placeholder="Last Name"
                                    value={formData.lastname}
                                    onChange={handleInputChange}
                                /><br />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                /><br />
                                <button onClick={handleUpdateProfile}>Update Profile</button>
                            </>
                        ) : (
                            <p>Loading user data...</p>
                        )}
                    </div>
                );
            case 'changePassword':
                return (
                    <div>
                        <h2>Change Password</h2>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={password}
                            onChange={handlePasswordChange}
                        /><br />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                        /><br />
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        <button onClick={handleChangePassword}>Change Password</button>
                    </div>
                );
            case 'manageListings':
                return (
                    <div>
                        <h2>Manage Listings</h2>
                        <div style={{ marginBottom: '20px' }}>
                          <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={newListing.title}
                            onChange={handleNewListingChange}
                          />
                          <input
                            type="text"
                            name="brand"
                            placeholder="Brand"
                            value={newListing.brand}
                            onChange={handleNewListingChange}
                          />
                          <input
                            type="text"
                            name="image"
                            placeholder="Image URL"
                            value={newListing.image}
                            onChange={handleNewListingChange}
                          />
                          <input
                            type="number"
                            name="stock"
                            placeholder="Stock"
                            value={newListing.stock}
                            onChange={handleNewListingChange}
                          />
                          <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={newListing.price}
                            onChange={handleNewListingChange}
                          />
                          <button onClick={handleAddListing}>Add New Listing</button>
                        </div>
                        <ul>
                          {listings.length === 0 ? (
                            <li>No listings found.</li>
                          ) : (
                            listings.map((listing) => (
                              <li key={listing._id} style={{ marginBottom: '10px' }}>
                                <b>{listing.title}</b> - ${listing.price} -{' '}
                                {listing.enabled ? 'Enabled' : 'Disabled'} <br />
                                <button onClick={() => toggleListingStatus(listing._id, listing.enabled)}>
                                  {listing.enabled ? 'Disable' : 'Enable'}
                                </button>{' '}
                                <button onClick={() => deleteListing(listing._id)}>Delete</button>
                              </li>
                            ))
                          )}
                        </ul>
                        </div>
                );

            case 'viewComments':
              return (
                <div>
                  <h2>View Comments</h2>
                  {listings.length === 0 && <p>No listings to show comments.</p>}
                  {listings.map((listing) => (
                    <div key={listing._id} style={{ marginBottom: '20px' }}>
                      <h3>{listing.title}</h3>
                      {listing.reviews.length === 0 ? (
                        <p>No comments yet.</p>
                      ) : (
                        <ul>
                          {listing.reviews.map((review) => {
                            const isHidden = review.hidden === "true";
                            return (
                              <li
                                key={review.reviewer}
                                style={{ opacity: isHidden ? 0.5 : 1 }}
                              >
                                <b>{review.user?.firstname || 'Unknown'}</b>: {review.comment}{' '}
                                {isHidden ? '[Hidden]' : ''}
                                <button
                                  onClick={() =>
                                    toggleCommentHidden(listing._id, review.reviewer, isHidden)
                                  }
                                >
                                  {isHidden ? 'Show' : 'Hide'}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      <hr />
                    </div>
                  ))}
                </div>
              );


            default:
                return null;
        }
    };

    const handleSignOut = () => {
        window.location.href = '/'; // Redirect to the homepage
    };

    return (
        <div className="profile-container">
            <h1>My Profile</h1>
            <div className="profile-tabs">
                <button onClick={() => setActiveTab('editProfile')}>Edit Profile</button>
                <button onClick={() => setActiveTab('changePassword')}>Change Password</button>
                <button onClick={() => setActiveTab('manageListings')}>Manage Listings</button>
                <button onClick={() => setActiveTab('viewComments')}>View Comments</button>
            </div>
            <hr />
            <div className="profile-section">{renderTabContent()}</div>

            <button className="signout-button" onClick={handleSignOut}>Sign Out</button>

            {/* Password modal */}
            {showPasswordModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>Enter your password to update profile</h3>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        <button onClick={handleSubmitPassword}>Submit</button>
                        <button onClick={() => setShowPasswordModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
};

export default Profile;
