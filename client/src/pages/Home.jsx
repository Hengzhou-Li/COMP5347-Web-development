import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PhoneCard from '../components/PhoneCard';
import SoldOutSoon from '../components/SoldOutSoon';
import BestSellers from '../components/BestSellers';
import TopBar from '../components/TopBar';
// import PhoneDetail from '../components/PhoneDetail'; // 后面实现这个

function Home() {
  const [phones, setPhones] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [maxPrice, setMaxPrice] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [pageState, setPageState] = useState('home'); // 'home' | 'search' | 'item'
  const [selectedPhoneId, setSelectedPhoneId] = useState(null);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPageState('search'); // 切换为 search 状态
  };

  useEffect(() => {
    if (pageState !== 'search' || maxPrice === null) return;

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
  }, [searchTerm, selectedBrand, maxPrice, pageState]);

  return (
    <div style={{ padding: '20px' }}>
      <TopBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />

      {/* home 状态显示 SoldOutSoon 和 BestSeller */}
      {pageState === 'home' && (
        <>
          <SoldOutSoon />
          <BestSellers />
        </>
      )}

      {/* search 状态显示搜索结果 */}
      {pageState === 'search' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px' }}>
          {phones.map((phone) => (
            <PhoneCard
              key={phone._id}
              phone={phone}
              onClick={() => {
                setSelectedPhoneId(phone._id);
                setPageState('item');
              }}
            />
          ))}
        </div>
      )}

      {/* item 状态显示详情页（暂留空，后面加 PhoneDetail） */}
      {pageState === 'item' && selectedPhoneId && (
        <div>
          {/* <PhoneDetail phoneId={selectedPhoneId} goBack={() => setPageState('home')} /> */}
          <h2>Phone Details for ID: {selectedPhoneId}</h2>
          <button onClick={() => setPageState('home')}>Back to Home</button>
        </div>
      )}
    </div>
  );
}

export default Home;