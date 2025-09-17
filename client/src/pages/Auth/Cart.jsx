import '../allPages.css';
import {useLocation, useNavigate} from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

function Cart() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedQuantity, setEditedQuantity] = useState(1);
  const [selectedItems, setSelectedItems] = useState({}); // 记录勾选状态



  const fetchCart = async () => {
    try {
      if (!user || !user.id) return;

      const res = await axios.get(`http://localhost:5000/api/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(res.data);

      // 初始化所有项为未选中
      const selection = {};
      res.data.items.forEach(item => {
        selection[item._id] = false;
      });
      setSelectedItems(selection);
    } catch (err) {
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user, token]);

  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${user.id}/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
      alert('Failed to remove item');
    }
  };

  const handleEditSave = async (itemId) => {
    if (editedQuantity === 0) {
      // 数量为0则删除商品
      try {
        await axios.delete(`http://localhost:5000/api/cart/${user.id}/item/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingItemId(null);
        fetchCart();
      } catch (err) {
        console.error('Failed to delete item with quantity 0:', err);
        alert('Failed to delete item');
      }
    } else {
      try {
        await axios.put(
            `http://localhost:5000/api/cart/${user.id}/item/${itemId}`,
            { quantity: editedQuantity },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingItemId(null);
        fetchCart();
      } catch (err) {
        console.error('Failed to update quantity:', err);
        alert('Failed to update quantity');
      }
    }
  };

  const toggleSelect = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = Object.values(selectedItems).every(Boolean);
    const updated = {};
    Object.keys(selectedItems).forEach(id => {
      updated[id] = !allSelected;
    });
    setSelectedItems(updated);
  };



  const handleCheckout = async () => {
    const confirmed = window.confirm('Are you sure you want to check out these items?');
    if (!confirmed) return;

    const selectedCartItems = cart?.items?.filter(item => selectedItems[item._id]);

    if (!selectedCartItems || selectedCartItems.length === 0) {
      alert('No items selected.');
      return;
    }

    try {
      const response = await axios.post(
          `http://localhost:5000/api/orders/${user.id}`, //
          {
            selectedItemIds: selectedCartItems.map(item => item._id)  //
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
      );

      alert('Order placed successfully!');
      await fetchCart();
      // 可选跳转
      // navigate('/orders');
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Checkout failed. Please try again.');
    }
  };



  if (loading) return <div>Loading cart...</div>;
  if (!cart || !cart.items || cart.items.length === 0) return <div>Your cart is empty.</div>;

  const brands = [...new Set(cart.items.map(item => item.phone?.brand).filter(Boolean))];
  const filteredItems = selectedBrand === 'All'
      ? cart.items
      : cart.items.filter(item => item.phone?.brand === selectedBrand);

  const totalPrice = filteredItems.reduce((sum, item) => {
    return selectedItems[item._id] ? sum + item.priceSnapshot * item.quantity : sum;
  }, 0);

  return (
      <div style={{ padding: '2rem' }}>
        <h2>Your Shopping Cart</h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ marginRight: '1rem' }}>Filter by Brand:</label>
          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
            <option value="All">All</option>
            {brands.map((brand, idx) => (
                <option key={idx} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
          <tr>
            <th>
              <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                      Object.keys(selectedItems).length > 0 &&
                      Object.values(selectedItems).every(Boolean)
                  }
              />
            </th>
            <th>Title</th>
            <th>Brand</th>
            <th>Stock</th>
            <th>Seller</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Action</th>
          </tr>
          </thead>
          <tbody>
          {filteredItems.map(item => {
            const isEditing = editingItemId === item._id;
            const maxStock = item.phone?.stock ?? 1;

            return (
                <tr key={item._id}>
                  <td>
                    <input
                        type="checkbox"
                        checked={selectedItems[item._id] || false}
                        onChange={() => toggleSelect(item._id)}
                    />
                  </td>
                  <td>
                    <span
                        onClick={() => navigate(`/phone/${item.phone._id}`)}
                        style={{textDecoration: 'underline', color: 'blue', cursor: 'pointer'}}
                        title="View phone details"
                    >
                      {item.phone?.title || 'Unknown'}
                    </span>
                  </td>
                  <td>{item.phone?.brand || 'Unknown'}</td>
                  <td>{item.phone?.stock ?? 'N/A'}</td>
                  <td>{item.phone?.seller ? `${item.phone.seller.firstname} ${item.phone.seller.lastname}` : 'Unknown'}</td>
                  <td>${item.priceSnapshot}</td>
                  <td>
                    {isEditing ? (
                        <input
                            type="number"
                            min="0"
                            max={maxStock}
                            value={editedQuantity}
                            onChange={(e) => setEditedQuantity(Math.min(maxStock, Math.max(0, parseInt(e.target.value) || 0)))}
                        />
                    ) : (
                        item.quantity
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                        <>
                          <button
                              onClick={() => handleEditSave(item._id)}
                              disabled={editedQuantity > maxStock}
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingItemId(null)}>Cancel</button>
                        </>
                    ) : (
                        <>
                          <button onClick={() => {
                            setEditingItemId(item._id);
                            setEditedQuantity(item.quantity);
                          }}>
                            Edit
                          </button>
                          <button onClick={() => handleRemove(item._id)} style={{ color: 'red', marginLeft: '8px' }}>
                            Delete
                          </button>
                        </>
                    )}
                  </td>
                </tr>
            );
          })}
          </tbody>
        </table>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Total (Selected): ${totalPrice.toFixed(2)}</h3>
          <button
              style={{padding: '0.5rem 1rem', fontSize: '16px'}}
              disabled={selectedItems.length === 0}
              onClick={handleCheckout}
          >
            Check Out
          </button>
        </div>
      </div>
  );
}

export default Cart;