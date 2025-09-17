import { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../../components/Pagination';
import { useLocation } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ReviewModeration() {
    const [reviews, setReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const query = useQuery();
    const seller = query.get('seller') || '';
    const [userSearchTerm, setUserSearchTerm] = useState(seller);
    const title = query.get('title') || '';
    const [listingSearchTerm, setListingSearchTerm] = useState(title);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/reviews');
                setReviews(res.data);
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
            }
        };
        fetchReviews();
    }, []);

    // 过滤评论内容，用户名和listing标题，但显示所有（包括隐藏）
    const filtered = reviews.filter(review => {
        const content = review.content || '';
        const contentMatch = content.toLowerCase().includes(searchTerm.toLowerCase());

        const userFullName = review.user
            ? `${review.user.firstname || ''} ${review.user.lastname || ''}`.toLowerCase()
            : '';
        const userMatch = userFullName.includes(userSearchTerm.toLowerCase());

        const listingTitle = review.listing?.title?.toLowerCase() || '';
        const listingMatch = listingTitle.includes(listingSearchTerm.toLowerCase());

        return contentMatch && userMatch && listingMatch;
    });

    const indexOfLast = currentPage * itemsPerPage;
    const current = filtered.slice(indexOfLast - itemsPerPage, indexOfLast);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Review & Comment Moderation</h2>

            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Search by content"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{ marginRight: '1rem', padding: '0.5rem', width: '250px' }}
                />
                <input
                    type="text"
                    placeholder="Search by user name"
                    value={userSearchTerm}
                    onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{ marginRight: '1rem', padding: '0.5rem', width: '250px' }}
                />
                <input
                    type="text"
                    placeholder="Search by listing title"
                    value={listingSearchTerm}
                    onChange={(e) => {
                        setListingSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{ padding: '0.5rem', width: '250px' }}
                />
            </div>

            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Listing</th>
                        <th>Content</th>
                        <th>Rating</th>
                        <th>Visible</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {current.map(review => (
                        <tr key={review._id} style={{ opacity: review.hidden === "true" ? 0.5 : 1 }}>
                            <td>
                                {review.user
                                    ? `${review.user.firstname || ''} ${review.user.lastname || ''}`.trim()
                                    : 'N/A'}
                            </td>
                            <td>{review.listing?.title || 'N/A'}</td>
                            <td>{review.content || '-'}</td>
                            <td>{review.rating ?? '-'}</td>
                            <td>{review.hidden === "true" ? 'Hidden' : 'Visible'}</td>
                            <td>
                                <button
                                  onClick={async () => {
                                    try {
                                      await axios.put(
                                        `http://localhost:5000/api/admin/reviews/${review.listing._id}/${review.user._id}/toggle-visible`
                                      );

                                      // 重新拉最新的reviews数据
                                      const res = await axios.get('http://localhost:5000/api/admin/reviews');
                                      setReviews(res.data);
                                    } catch (err) {
                                      alert('Failed to toggle visibility');
                                    }
                                  }}
                                >
                                  {review.hidden === "true" ? 'Show' : 'Hide'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
}

export default ReviewModeration;
