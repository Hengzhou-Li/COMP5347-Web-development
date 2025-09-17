import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BrandDropdown({ selectedBrand, setSelectedBrand }) {
  const [brands, setBrands] = useState(["All"]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/phones/brands');
        setBrands(res.data);
      } catch (err) {
        console.error("Failed to load brands:", err);
      }
    };

    fetchBrands();
  }, []);

  const handleChange = (e) => {
    setSelectedBrand(e.target.value);
  };

  return (
    <select value={selectedBrand} onChange={handleChange}>
      {brands.map((brand) => (
        <option key={brand} value={brand}>
          {brand}
        </option>
      ))}
    </select>
  );
}

export default BrandDropdown;