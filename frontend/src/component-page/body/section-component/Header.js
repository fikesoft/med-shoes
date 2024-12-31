import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'; // if you want to link to /cart
import logo from '../../../img/nikeicon.svg'
import basket from '../../../img/bag.svg'
import '../../../scss/section-components/header.scss'

export const Header = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(savedCart.length);
  }, []);

  return (
    <header className="header">
      <nav className='nav-bar'>
        <div className='nav-bar-logo'>
          <img src={logo} alt='NIKE'></img>
        </div>
        <div className='nav-bar-menu'>
          <ul className='nav-bar-menu-inner'>
            <li className='menu-item'>New Arrivals</li>
            <li className='menu-item'>Men</li>
            <li className='menu-item'>Women</li>
            <li className='menu-item'>Kids</li>
            <li className='menu-item'>Collection</li>
          </ul>
        </div>
        <div className='nav-bar-actions' style={{ position: 'relative' }}>
          {/* Link to your Cart page */}
          <Link to="/cart">
            <img src={basket} alt='basket' />
            {cartCount > 0 && (
              <span 
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'red',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div className='sub-header'>
          <p className='sub-header-text'>Members : Free Shipping on Orders $50+</p>
          <a className='sub-header-link' href='#'>Join now</a>
      </div>
    </header>
  )
}
export default Header;
