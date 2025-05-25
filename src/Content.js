//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for the content of the home page
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
import { Pagination } from '@mui/material';

const Content = () => {
  const [item, setItem] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Number of items per page
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
  }

  // source: https://www.youtube.com/watch?v=uRoJJKJMbXQ&t=620s
  const dispatch = useDispatch();
  const HandleAddToCart = (item) => {
    dispatch(addToCart(item));
  }

  // Get data from the Stocktake table
  useEffect(() => {
    const promise = axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake?shuffle=10&limit=200", { headers: headers })
    promise.then((response) => {
      setItem(response.data.list);
    })
      .catch((error) => {
        console.error("error", error);
      });
  }, [])

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = item.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      <h1 className='title'>
        Home Page
      </h1>
      <ul className='itemContainer'>
        {currentItems.map((b) =>
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
      <Pagination
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
        count={Math.ceil(item.length / itemsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
      />
    </div>
  );
}

export default Content;
