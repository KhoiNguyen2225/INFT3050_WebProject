//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for the search result page of the application
//Last modified: 11/03/2024
import { useState } from 'react';
import * as React from 'react';  
import './Content.css'
import { NavLink } from 'react-router-dom';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { addToCart } from './helpers/cartSlice';
import book from './assets/book.jpg';

const Content = () => {
  const [item, setItem] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
  }
  // Get the search term from the URL
  const searchTerm = useParams().term;
 
  //have to be this long because the nested[Product][where]=(Name,like,${searchTerm}) is not working in the stcoktake list table
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try{
      // Get the ItemId from the Stocktake List table
      const promise = await axios.get(`http://localhost:8080/api/v1/db/data/v1/inft3050/Product?nested[Stocktake List][fields]=ItemId&fields=Stocktake List&where=(Name,like,${searchTerm})`, {headers: headers})
        let resultID = [];
        for (let i=0; i<promise.data.list.length; i++) {
          console.log('response:', promise.data.list[i]['Stocktake List']);
          for (let j=0; j<promise.data.list[i]['Stocktake List'].length; j++) {
            resultID.push(promise.data.list[i]['Stocktake List'][j].ItemId);
          }
        }    
        console.log('temp:', resultID);
        console.log('temp.length:', resultID.length);
        
        const searchResult = [];
        // Get the data from the Stocktake table
        for (let k=0; k<resultID.length; k++) {
          const promise2 = await axios.get(`http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake/${resultID[k]}`, {headers: headers})
          console.log('response:', promise2.data);
          searchResult.push(promise2.data);
          }
          setItem(searchResult);
        } catch (error) {
          console.error("error", error);
        } finally {
          setLoading(false);
        }
    };
    fetchItem();
    }, [searchTerm]);

  const dispatch = useDispatch();
    const HandleAddToCart = (item) => {
    dispatch(addToCart(item));
}

console.log('item:', item);
    return (        
      <div>
      {loading ? (
        <h1 className='title'>Searching...</h1>
      ) : (
        item.length === 0 ? 
        <h1 style={{ justifySelf: "center", fontSize: 50, fontWeight: "bold" }}>No result found for "{searchTerm}"</h1> :
        <div>
          <h1 className='title'>
            Search Result for "{searchTerm}"
          </h1>
          <ul className='itemContainer'>
            {item.map((b) =>
              <li className='items' key={b.ItemId}>
                <NavLink to={"/item/" + b.ItemId} className='item'>
                  <img src={book} className='itemPic' />
                  <p className='itemName'> {b.Product.Name}</p>
                  <p className='itemSoucre'>({b.Source.SourceName})</p>
                  <p className='itemPrice'> ${b.Price} </p>
                </NavLink>
                <div className='buttonHolder'>
                  <button className='addToCartButton' onClick={() => HandleAddToCart(b)} type='button'><AddShoppingCartIcon style={{ paddingTop: 1 + "px" }} /> Add to cart</button>
                </div>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
    );

    
}

export default Content;
