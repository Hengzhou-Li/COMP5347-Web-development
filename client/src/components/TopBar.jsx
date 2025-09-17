import React from 'react';
import SearchBar from './SearchBar';
import PriceSlider from './PriceSlider';
import BrandDropdown from './BrandDropdown';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function TopBar({
  searchInput,
  setSearchInput,
  handleSearch,
  selectedBrand,
  setSelectedBrand,
  maxPrice,
  setMaxPrice
}) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', padding: '10px' }} id="topBar">
      <h2>OldPhoneDeals</h2>

      <SearchBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
      />

      <BrandDropdown
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
      />

      <PriceSlider
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />

      <button onClick={() => navigate('/cart')}>Checkout</button>

    </div>
  );
}

export default TopBar;