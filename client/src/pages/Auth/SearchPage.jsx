import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PhoneCard from '../../components/PhoneCard';
import TopBar from '../../components/TopBar';
import Pagination from '../../components/Pagination'; // 确保路径正确

function SearchPage() {
  const [phones, setPhones] = useState([]);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [maxPrice, setMaxPrice] = useState(null);

  // 新增分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const phonesPerPage = 30; // 每页显示几个手机，可调

  // 处理搜索按钮点击
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1); // 每次搜索后重置为第一页
  };

  // 根据 searchTerm, selectedBrand, maxPrice 拉取数据
  useEffect(() => {
    const fetchPhones = async () => {
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedBrand && selectedBrand !== 'All') params.brand = selectedBrand;
        if (maxPrice) params.maxPrice = maxPrice;

        const res = await axios.get('http://localhost:5000/api/phones', { params });
        setPhones(res.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch phones.');
        console.error(err);
      }
    };

    fetchPhones();
  }, [searchTerm, selectedBrand, maxPrice]);

  // 分页处理
  const indexOfLastPhone = currentPage * phonesPerPage;
  const indexOfFirstPhone = indexOfLastPhone - phonesPerPage;
  const currentPhones = phones.slice(indexOfFirstPhone, indexOfLastPhone);
  const totalPages = Math.ceil(phones.length / phonesPerPage);

  return (
    <div style={{ padding: '2rem' }}>
      <TopBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />

      <h2>Search Phones</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        {currentPhones.length > 0 ? (
          currentPhones.map((phone) => (
            <PhoneCard key={phone._id} phone={phone} mode="full" />
          ))
        ) : (
          <p>No matching phones found.</p>
        )}
      </div>

      {/* 分页控件 */}
      {phones.length > phonesPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

export default SearchPage;


