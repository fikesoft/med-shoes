import React from 'react'
import CatalogItem from './../../CatalogItem'
import '../../../scss/section-components/shop.scss'

export const Shop = () => {
  return (
    <section className='shop'>
        <div className='shop-title-link'>
            <h1 className='title'>NEW ARRIVALS</h1>
            <a className='title-link' href='#'>See All Items</a>
        </div>
        <div className='shop-catalog'>
            <CatalogItem/>
        </div>
    </section>
  )
}
export default Shop
