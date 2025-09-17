import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../../components/Pagination';

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchKeyword, setSearchKeyword] = useState('');

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/orders');
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, statusFilter, searchKeyword]);

    const filterOrders = () => {
        let filtered = [...orders];

        if (statusFilter !== 'All') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        if (searchKeyword.trim() !== '') {
            filtered = filtered.filter(order =>
                order.items.some(item =>
                    item.title.toLowerCase().includes(searchKeyword.toLowerCase())
                )
            );
        }

        setFilteredOrders(filtered);
    };

    const handleDeliver = async (orderId) => {
        try {
            await axios.put(
                `http://localhost:5000/api/admin/orders/${orderId}/status`,
                {}
            );
            alert('Order marked as Delivering. It will auto-complete in 30 seconds.');
            // Refresh orders
            const res = await axios.get('http://localhost:5000/api/admin/orders', {
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to update order status:', err);
            alert('Failed to update order status.');
        }
    };

    const indexOfLast = currentPage * ordersPerPage;
    const indexOfFirst = indexOfLast - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Order Management</h2>

            <div style={{ marginBottom: '1rem' }}>
                <label>Status: </label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ marginRight: '1rem' }}>
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Delivering">Delivering</option>
                    <option value="Completed">Completed</option>
                </select>

                <label>Search Item Title: </label>
                <input
                    type="text"
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    placeholder="Search item title"
                />
            </div>

            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {filteredOrders.map(order => (
                    <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.user?.email || 'Unknown'}</td>
                        <td>
                            <ul>
                                {order.items.map((item, idx) => (
                                    <li key={idx}>{item.title} x {item.quantity}</li>
                                ))}
                            </ul>
                        </td>
                        <td>${order.totalAmount.toFixed(2)}</td>
                        <td>{order.status}</td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td>{new Date(order.updatedAt).toLocaleString()}</td>
                        <td>
                            {order.status === 'Pending' && (
                                <button onClick={() => handleDeliver(order._id)}>Deliver</button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
}

export default OrderManagement;