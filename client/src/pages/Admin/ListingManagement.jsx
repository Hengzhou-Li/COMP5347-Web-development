import { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../../components/Pagination';
import {useLocation, useNavigate} from 'react-router-dom';

// 可以从user management 里跳转直接搜索
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ListingManagement() {
    const [listings, setListings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const query = useQuery();
    const initialSeller = query.get('seller') || '';
    const [sellerSearchTerm, setSellerSearchTerm] = useState(initialSeller);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', price: '', stock: '' });
    const navigate = useNavigate();


    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;


    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/listings');
                setListings(res.data);
            } catch (err) {
                console.error('Failed to fetch listings:', err);
            }
        };
        fetchListings();
    }, []);

    const filtered = listings.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const brandMatch = item.brand.toLowerCase().includes(searchTerm.toLowerCase());

        const fullName = item.seller
            ? `${item.seller.firstname} ${item.seller.lastname}`.toLowerCase()
            : '';
        const sellerMatch = fullName.includes(sellerSearchTerm.toLowerCase());

        // 必须两个搜索条件都满足
        return (titleMatch || brandMatch) && sellerMatch;
    });

    const indexOfLast = currentPage * itemsPerPage;
    const current = filtered.slice(indexOfLast - itemsPerPage, indexOfLast);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        <div style={{padding: '2rem'}}>
            <h2>Listing Management</h2>

            <input
                type="text"
                placeholder="Search by title or brand"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
                style={{marginBottom: '1rem', marginRight: '1rem', padding: '0.5rem', width: '250px'}}
            />

            <input
                type="text"
                placeholder="Search by seller name"
                value={sellerSearchTerm}
                onChange={(e) => {
                    setSellerSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
                style={{marginBottom: '1rem', padding: '0.5rem', width: '250px'}}
            />

            <table border="1" cellPadding="8">
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Seller</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {current.map(listing => {
                    const isEditing = listing._id === editingId;
                    return (
                        <tr key={listing._id} style={{opacity: listing.isActive ? 1 : 0.5}}>
                            <td>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={e =>
                                            setEditForm({...editForm, title: e.target.value})}
                                    />
                                ) : (
                                    listing.title
                                )}
                            </td>
                            <td>{listing.brand}</td>
                            <td>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={editForm.price}
                                        onChange={e =>
                                            setEditForm({...editForm, price: e.target.value})
                                        }
                                    />
                                ) : (
                                    listing.price
                                )}
                            </td>
                            <td>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={editForm.stock}
                                        onChange={e =>
                                            setEditForm({...editForm, stock: e.target.value})}
                                    />
                                ) : (
                                    listing.stock
                                )}
                            </td>
                            <td>
                                {listing.seller
                                    ? `${listing.seller.firstname || ''} ${listing.seller.lastname || ''}`.trim()
                                    : 'N/A'}
                            </td>
                            <td>{listing.isActive ? 'Active' : 'Inactive'}</td>
                            <td style={{whiteSpace: 'nowrap'}}>
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await axios.put(
                                                        `http://localhost:5000/api/admin/listings/${listing._id}`,
                                                        editForm
                                                    );
                                                    setListings(listings.map(l =>
                                                        l._id === listing._id ? res.data.listing : l));
                                                    setEditingId(null);
                                                } catch (err) {
                                                    alert('Update failed');
                                                }
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button onClick={() => setEditingId(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setEditingId(listing._id);
                                                setEditForm({
                                                    title: listing.title,
                                                    price: listing.price,
                                                    stock: listing.stock,
                                                });
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await axios.put(
                                                        `http://localhost:5000/api/admin/listings/${listing._id}/toggle-active`
                                                    );
                                                    setListings(listings.map((l) =>
                                                        l._id === listing._id ? res.data.listing : l
                                                    ));
                                                } catch (err) {
                                                    alert('Failed to update status');
                                                }
                                            }}
                                        >
                                            {listing.isActive ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            style={{marginLeft: '6px', color: 'red'}}
                                            onClick={async () => {
                                                const confirmed = window.confirm('Are you sure you want to delete this listing?');
                                                if (!confirmed) return;
                                                try {
                                                    await axios.delete(`http://localhost:5000/api/admin/listings/${listing._id}`);
                                                    setListings(listings.filter(l => l._id !== listing._id));
                                                } catch (err) {
                                                    alert('Delete failed');
                                                }
                                            }}
                                        >Delete
                                        </button>
                                        <button
                                            style={{marginLeft: '6px'}}
                                            onClick={() => {
                                                const title = listing.title;
                                                navigate(`/admin/reviews?title=${encodeURIComponent(title)}`);
                                            }}
                                        >
                                            View Reviews
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>
        </div>
    );
}

export default ListingManagement;
