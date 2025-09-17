import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PriceSlider({ maxPrice, setMaxPrice }) {
  const [maxLimit, setMaxLimit] = useState(1000);
  const [internalMaxPrice, setInternalMaxPrice] = useState(1000); // 拖动中的状态

  useEffect(() => {
    const fetchMax = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/phones/max-price');
        const max = res.data.maxPrice;
        setMaxLimit(max);
        setInternalMaxPrice(max);
        setMaxPrice(max); // 页面初始时设置真正的 maxPrice
      } catch (err) {
        console.error("Failed to fetch max price", err);
      }
    };
    fetchMax();
  }, []);

  const handleChange = (e) => {
    setInternalMaxPrice(Number(e.target.value)); // 仅更新内部拖动值
  };

  const handleMouseUp = () => {
    setMaxPrice(internalMaxPrice); // 鼠标松开时才更新外部 maxPrice
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <label>Max Price: ${internalMaxPrice}</label>
      <input
        type="range"
        min={0}
        max={maxLimit}
        step={0.01}
        value={internalMaxPrice}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}

export default PriceSlider;