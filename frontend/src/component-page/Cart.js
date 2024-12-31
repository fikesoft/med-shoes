import React, { useEffect, useState } from "react";
import axios from "axios";
import '../scss/cart.scss'
function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  // Load from localStorage
  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);
  };

  // Remove item
  const handleRemoveItem = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // POST to /api.php/orders
  const handleBuy = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }

    try {
      const response = await axios.post("http://localhost/api.php/orders", {
        cartItems,
        userEmail: "guest@example.com"
      });
      alert(`Order placed! Order ID = ${response.data.orderId}`);

      // Clear cart
      setCartItems([]);
      localStorage.removeItem("cart");
    } catch (err) {
      console.error("Failed to create order:", err.response?.data || err.message);
      alert("Could not place order. Check console.");
    }
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p className="cart-empty">Cart is empty.</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Price</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.size}</td>
                  <td>{item.price} €</td>
                  <td>
                    <button
                      className="cart-remove-btn"
                      onClick={() => handleRemoveItem(idx)}
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="cart-buy-btn" onClick={handleBuy}>
            Buy
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;
