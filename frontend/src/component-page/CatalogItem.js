// src/components/section-components/CatalogItem.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../scss/section-components/shop.scss';

function CatalogItem() {
  const [items, setItems] = useState([]);
  // Track selected size per product ID
  const [selectedSizes, setSelectedSizes] = useState({});

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const response = await axios.get('http://localhost/api.php/catalog');
      // Ensure data is an array. If it's not, default to an empty array.
      if (Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch catalog items:', error.response?.data || error.message);
      setItems([]); // fallback to empty array on error
    }
  };

  // Handle size selection
  const handleSizeClick = (itemId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: size
    }));
  };

  // Add item to localStorage cart
  const handleAddToCart = (item) => {
    const chosenSize = selectedSizes[item.id];
    if (!chosenSize) {
      alert("Please select a size first!");
      return;
    }

    const newCartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      size: chosenSize,
      quantity: 1
    };

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    existingCart.push(newCartItem);
    localStorage.setItem("cart", JSON.stringify(existingCart));

    alert(`${item.name} (Size ${chosenSize}) added to cart!`);
  };

  return (
    <>
      {items.map(item => (
        <div key={item.id} className="shop-catalog-item">
          <div className="shop-catalog-item-img">
            <img
              src={item.image_url || 'fallback.png'}
              alt={item.alt_text || item.name || "Shoe Image"} 
            />
          </div>
          <div className="shop-catalog-item-info">
            <p className="title-item">{item.name}</p>
            <p className="category-item">{item.category}</p>
            <p className="price-item">{item.price} €</p>
          </div>
          {/* Hover display */}
          <div className="sizes">
            <p>Select Size:</p>
            <div className="size-buttons">
              {[40, 41, 42, 43, 44].map(size => (
                <button
                  key={size}
                  className={`size-button ${selectedSizes[item.id] === size ? 'active-size' : ''}`}
                  onClick={() => handleSizeClick(item.id, size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <button className="add-to-cart" onClick={() => handleAddToCart(item)}>
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

export default CatalogItem;
