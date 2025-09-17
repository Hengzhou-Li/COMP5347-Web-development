import { useEffect, useState } from 'react';
import Pagination from '../../components/Pagination';
import {useNavigate} from "react-router-dom";
import axios from 'axios';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ firstname: '', lastname: '', email: '' });
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/users');
                setUsers(res.data);
            } catch (err) {
                console.error('Failed to fetch users:', err);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
        const email = user.email.toLowerCase();
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || email.includes(term);
    });

    const indexOfLast = currentPage * usersPerPage;
    const indexOfFirst = indexOfLast - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div style={{ padding: '2rem' }}>
            <h2>User Management</h2>

            <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // 搜索后回到第一页
                }}
                style={{ marginBottom: '1rem', padding: '0.5rem', width: '300px' }}
            />

            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
                <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th style={{width: '160px'}}>Actions</th>
                    <th>View Listings/Reviews</th>
                </tr>
                </thead>
                <tbody>
                {currentUsers.map((user) => {
                    const isEditing = editingUser && editingUser._id === user._id;
                    const status = !user.verified
                        ? 'Not Verified'
                        : user.isActive
                            ? 'Active'
                            : 'Inactive';

                    return (
                        <tr key={user._id} style={{opacity: !user.isActive ? 0.5 : 1}}>
                            <td>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.firstname}
                                        onChange={(e) =>
                                            setEditForm({...editForm, firstname: e.target.value})
                                        }
                                    />
                                ) : (
                                    user.firstname
                                )}
                            </td>
                            <td>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.lastname}
                                        onChange={(e) =>
                                            setEditForm({...editForm, lastname: e.target.value})
                                        }
                                    />
                                ) : (
                                    user.lastname
                                )}
                            </td>
                            <td>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) =>
                                            setEditForm({...editForm, email: e.target.value})
                                        }
                                    />
                                ) : (
                                    user.email
                                )}
                            </td>
                            <td>{user.lastLoginDate || 'N/A'}</td>
                            <td>{status}</td>
                            <td style={{whiteSpace: 'nowrap'}}>
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await axios.put(
                                                        `http://localhost:5000/api/admin/users/${user._id}`,
                                                        editForm
                                                    );
                                                    setUsers(users.map((u) =>
                                                        u._id === user._id ? res.data.user : u
                                                    ));
                                                    setEditingUser(null);
                                                } catch (err) {
                                                    alert('Failed to update user');
                                                }
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button onClick={() => setEditingUser(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setEditingUser(user);
                                                setEditForm({
                                                    firstname: user.firstname,
                                                    lastname: user.lastname,
                                                    email: user.email,
                                                });
                                            }}
                                            disabled={!user.verified}
                                        >
                                            Edit
                                        </button>
                                        {user.verified && (
                                            <button
                                                style={{marginLeft: '6px'}}
                                                onClick={async () => {
                                                    try {
                                                        const res = await axios.put(
                                                            `http://localhost:5000/api/admin/users/${user._id}/toggle-active`
                                                        );
                                                        setUsers(users.map((u) =>
                                                            u._id === user._id ? res.data.user : u
                                                        ));
                                                    } catch (err) {
                                                        alert('Failed to update status');
                                                    }
                                                }}
                                            >
                                                {user.isActive ? 'Disable' : 'Enable'}
                                            </button>
                                        )}
                                        <button
                                            style={{marginLeft: '6px', color: 'red'}}
                                            onClick={async () => {
                                                if (!window.confirm('Are you sure to delete this user?')) return;
                                                try {
                                                    await axios.delete(`http://localhost:5000/api/admin/users/${user._id}`);
                                                    setUsers(users.filter((u) => u._id !== user._id));
                                                } catch (err) {
                                                    alert('Failed to delete user');
                                                }
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                            <td>

                                <button
                                    onClick={() => {
                                        const fullName = `${user.firstname} ${user.lastname}`;
                                        navigate(`/admin/listings?seller=${encodeURIComponent(fullName)}`);
                                    }}
                                >
                                    View Listings
                                </button>

                            <button
                            style={{ marginLeft: '6px' }}
                            onClick={() => {
                                const fullName = `${user.firstname} ${user.lastname}`;
                                navigate(`/admin/reviews?seller=${encodeURIComponent(fullName)}`);
                                }}
                            >
                                View Reviews
                            </button>

                            </td>
                        </tr>
                    );
                })}
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

export default UserManagement;