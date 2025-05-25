//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for the product page of the application
//Last modified: 11/03/2024
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import bookCover from './assets/bookCover.jpg';
import * as React from 'react';  
import "./Product.css";
import { useDispatch } from 'react-redux';
import { addToCart } from './helpers/cartSlice';


const Product = () =>{
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
      }
    const [item, setItem] = useState({});
    const [price, setPrice] = useState([]);
    const [cate, setCate] = useState({});
    const [productTable, setProductTable] = useState({});
    const [subGenreID, setSubGenreID] = useState({});
    const [subGenName, setSubGenName] = useState({});
    const [genre, setGenre] = useState({});
    const [sourceId, setSourceId] = useState([]);
    const [source, setSource] = useState([]);
    const [ productId, setProductId ] = useState("");
    const itemID = useParams().ID;

    const dispatch = useDispatch();
    const HandleAddToCart = (item) => {
      dispatch(addToCart(item));
  
  }
    // Get data from the Stocktake table
    useEffect (() => {
        //Send a GET request to the local JSON Server
        axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake/" + itemID, {headers: headers})
        .then((response) => {
          setItem(response.data);
          setProductId(response.data.ProductId);
          console.log('item:', response.data.ProductId);
          fetchProductTable(response.data.ProductId);
        }); 
        
        axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake/" + itemID, {headers: headers})
        .then((response) => {
            setSourceId(response.data.SourceId);    
        }); 
      }, [itemID])

    const fetchProductTable = async (productId) => {
        //Get the product table
        await axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Product/" + productId  ,{headers: headers})
        .then((response) => {
            setProductTable(response.data);
        }); 
        //Get the category of the product
        axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Product/"+productId+"?fields=Genre1&nested[Genre1][fields]=Name", {headers: headers})
        .then((response) => {
            setCate(response.data.Genre1);    
        }); 

        //Get the genre of the product
        axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Product/"+productId+"?fields=Genre", {headers: headers})
        .then((response) => {
            console.log('genre:', response.data.Genre);
            setGenre(response.data.Genre);
        }); 

        //Get the subgenre of the product
        axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Product/"+productId+"?fields=SubGenre", {headers: headers})
        .then((response) => {
            console.log('subgenre:', response.data.SubGenre);
            setSubGenreID(response.data.SubGenre);
        }); 
    }
    const fetchSource = async () => {
        try{
            const data = await axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Source/" + sourceId, { headers: headers })
            // sources.push(data.data);
            console.log('source:', data);
            // console.log('source:', data.data);
            setSource(data.data);
    } catch (error) {
        console.error("error", error);
    }}
     
    // set subgenre
    //source: https://stackoverflow.com/questions/57766593/react-hook-useeffect-fetch-data-using-axios-with-async-await-api-calling-cont and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
    const fetchData = async () => {
        try 
        {
            if (genre === 1) {
                const data = await axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/BookGenre/" + subGenreID, { headers: headers })
                setSubGenName(data.data);

            } else if (genre === 2) {
                const data = await axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/MovieGenre/" + subGenreID, { headers: headers })
                setSubGenName(data.data);

        } else if (genre === 3) {
                const data = await axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/GameGenre/" + subGenreID, { headers: headers })
                setSubGenName(data.data);
            }}
        catch (error) {
            console.error("error", error);
        }
    }

    useEffect (() => {
        if (genre !== undefined && subGenreID !== undefined && sourceId !== undefined) {
            fetchData();
            fetchSource();
        }
    }, [genre, subGenreID, sourceId]);
    
      //source: https://forum.freecodecamp.org/t/how-to-convert-date-to-dd-mm-yyyy-in-react/431093/3
        const date = new Date(productTable.Published).toLocaleDateString();
    return(
        <>
            <div className='productInfoContainer'>
                <div>
                    <img className='productImage' src={bookCover} alt={`${productTable.Name} cover`} />
                </div>
            <div className='productInfo'>
                <h1>{productTable.Name}</h1>
                <h2>By: {productTable.Author}</h2>
                <p>Category: {cate.Name}</p>
                <p>Genre: {subGenName.Name}</p>
                <p style={{ fontSize: 15 }}>Release date: {date}</p>
                <p>Source: {source.SourceName}</p>
                <h2 style={{ fontSize: 30 }}>
                    <p style={{ fontSize: 20 }}>Price: ${item.Price}</p>
                </h2>

                {source.ExternalLink !== null ? (
                    <div key={source.SourceId}>
                        {source.SourceName} Link: <a href={source.ExternalLink}>{source.ExternalLink}</a>
                    </div>)
                : null
            }
            <button className='addToCartButton' onClick={() => HandleAddToCart(item)} type='button'>
                <AddShoppingCartIcon style={{ paddingTop: 1 + "px" }} /> Add to cart
            </button>
            </div>
        </div>
        <div className='itemDes'>
            <h1>Description</h1>
            <p>{productTable.Description}</p>
        </div>
    </>
    )
}

export default Product;
