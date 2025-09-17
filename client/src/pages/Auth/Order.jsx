import '../allPages.css';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Order() {

    const { user, token } = useContext(AuthContext);
    const [orders, setOrders] = useState(null);
    const navigate = useNavigate();


    const fetchOrders = async () => {
        if (!user || !user.id) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/orders/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };

    const handleCancel = async (orderId) => {
        const confirmed = window.confirm('Are you sure you want to cancel this order?');
        if (!confirmed) return;

        try {
            await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Order cancelled successfully');
            fetchOrders(); // 刷新订单列表
        } catch (err) {
            console.error('Failed to cancel order:', err);
            alert('Failed to cancel order');
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user, token]);

    if (!orders || orders.length === 0) {
        return <div>No orders yet.</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Your Orders</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>
                            <ul>
                                {order.items.map((item, idx) => (
                                    <li key={idx}>
                                          <span
                                              onClick={() => navigate(`/phone/${item.phone}`)} // item.phone 是 ObjectId
                                              style={{textDecoration: 'underline', cursor: 'pointer', color: 'blue'}}
                                              title="View phone details"
                                          >
                                            {item.title}
                                          </span>{' '}
                                        × {item.quantity} (${item.price} each)
                                    </li>
                                ))}
                            </ul>
                        </td>
                        <td>${order.totalAmount.toFixed(2)}</td>
                        <td>{order.status || 'Pending'}</td>
                        <td>{new Date(order.updatedAt).toLocaleString()}</td>
                        <td>
                            {order.status === 'Pending' && (
                                <button onClick={() => handleCancel(order._id)}>
                                    Cancel Order
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Order;