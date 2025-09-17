import React from 'react';

function SearchBar({ searchInput, setSearchInput, handleSearch }) {
  const handleChange = (e) => {
    setSearchInput(e.target.value);
  };

  return (
    <div style={{ marginTop: '20px' }} id="searchBar">
      <input
        type="text"
        placeholder="Search by phone title"
        value={searchInput}
        onChange={handleChange}
        style={{ padding: '8px', width: '300px', marginRight: '10px' }}
      />
      <button onClick={handleSearch} style={{ padding: '8px 12px', fontWeight: 'bold' }}>
        Search
      </button>
    </div>
  );
}

export default SearchBar;
