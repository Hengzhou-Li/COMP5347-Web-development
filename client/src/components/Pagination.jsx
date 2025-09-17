
// 分页模块
import {useState} from "react";

function Pagination({ currentPage, totalPages, onPageChange }) {
    const [inputPage, setInputPage] = useState('');
    const handleJump = () => {
        const pageNum = parseInt(inputPage, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
            setInputPage('');
        } else {
            alert(`Please enter a number between 1 and ${totalPages}`);
        }
    };

    return (
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                Prev
            </button>

            <span>
        Page {currentPage} of {totalPages}
      </span>

            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
            </button>

            <div>
                <input
                    type="number"
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    placeholder="Jump to page"
                    style={{ width: '100px', padding: '4px' }}
                />
                <button onClick={handleJump} style={{ marginLeft: '4px' }}>
                    Go
                </button>
            </div>
        </div>
    );
}

export default Pagination;