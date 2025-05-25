//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for managing the content of the game category page
//Last modified: 11/03/2024
import { useState } from 'react';
import * as React from 'react';
import './Content.css'
import { NavLink } from 'react-router-dom';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import { addToCart } from './helpers/cartSlice';
import book from './assets/book.jpg';

const Content = () => {
  const [item, setItem] = useState([]);
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
  }

  useEffect(() => {
    const promise = axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake?where=(SourceId,eq,3)~or(SourceId,eq,8)", {headers: headers})
    promise.then ((response) => {
    setItem(response.data.list);
    console.log('item:', response.data.list);

  })
  .catch((error) => {
    console.error("error", error);
  });
}, [])

const dispatch = useDispatch();
  const HandleAddToCart = (item) => {
    dispatch(addToCart(item));
}

    return (        
      <div>
        <h1 className='title'>
          Games
        </h1>
        <ul className='itemContainer'>
          {item.map((b) => 
            <li className='items' >
                <NavLink to = {"/item/" + b.ItemId} className='item'> 
                  <img src={book} className='itemPic'/>
                  <p className='itemName'> {b.Product.Name}</p>
                  <p className='itemSoucre'>({b.Source.SourceName})</p>
                  <p className='itemPrice'> ${b.Price} </p>
                </NavLink> 
                <div className='buttonHolder'>
                  <button className='addToCartButton' onClick={()=> HandleAddToCart(b)} type='button'><AddShoppingCartIcon style={{paddingTop: 1 +"px"}}/> Add to cart</button>
                </div>
                
            </li>
          )}
        </ul>
      </div>
      );
  

    
}

export default Content;
