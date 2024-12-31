import React from 'react'
import shoesImg from '../../../img/Shoes.png';
import '../../../scss/section-components/landpage.scss'
import limitedEdition from '../../../img/Limited Edition.png';
export const Landpage = () => {
  return (
    <section className='landpage'>
        {/*Content like title---------------*/}
        <div className='landpage-content'>
            <div className='landpage-content-title'>
                <h1 className='title'>RETRO LOW</h1>
                <h1 className='title-w-bg'>VOODOO</h1>
            </div>
            <div className='landpage-text'>
                The Nike Dunk Low SE Jackpot GS is a low-cut
                sneaker with hints of grey, white, blue, and red.
            </div>
            <button className='button-shop'>
                Shop Now
            </button>
        </div>
        {/*Content img and z-indexing--------------- */}
       <div className='landpage-hero'>
            <div className='back-transparent-circle'> </div>
            <div className='landpage-circle-limited'>
                <img src={limitedEdition} alt='limited edition'></img>    
            </div>
            <div className='shoes'>
                <img src={shoesImg} alt='hero'></img>
            </div>
            
        </div>
    </section> 
  )
}
export default Landpage;
