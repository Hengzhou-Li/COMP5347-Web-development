import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BrandDropdown from '../components/BrandDropdown';
import PriceSlider from '../components/PriceSlider';
import PhoneCard from '../components/PhoneCard';
import SearchBar from '../components/SearchBar';
import SoldOutSoon from '../components/SoldOutSoon';

function Main_page() {
  const [phones, setPhones] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [maxPrice, setMaxPrice] = useState(null);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // 用于触发搜索


  const handleSearch = () => {
    setSearchTerm(searchInput); // 点击按钮时才更新 searchTerm
  };

  useEffect(() => {
    if (maxPrice === null) return;

    const fetchPhones = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/phones', {
          params: {
            search: searchTerm,
            brand: selectedBrand,
            minPrice: 0,
            maxPrice
          }
        });
        setPhones(response.data);
      } catch (err) {
        console.error('Error fetching phones:', err);
      }
    };

    fetchPhones();
  }, [searchTerm, selectedBrand, maxPrice]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>OldPhoneDeal</h1>

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

      <SoldOutSoon />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px' }}>
        {phones.map((phone) => (
          <PhoneCard key={phone._id} phone={phone} />
        ))}
      </div>
    </div>
  );
}

export default Main_page;


