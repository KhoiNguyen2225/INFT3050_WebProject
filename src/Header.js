//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for the header of the website, including the search bar, logo, and navigation links
//Last modified: 11/03/2024
import {  Input, TextField } from "@mui/material";
import * as React from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import { NavLink } from 'react-router-dom';
import "./style.css";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import logo from './assets/logo.png';
import { useAuth } from './AuthProvider';
import { useSelector } from "react-redux";
import searchIcon from './assets/searchIcon.webp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';


const Header =()=>  {
    const navigate = useNavigate();
    const auth = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const userID = useSelector((state) => state.auth.userID);
    const role = useSelector((state) => state.auth.role);

    //Log testing for userID, isLoggedIn, role ========================================================
    console.log("userID:", userID);
    console.log("isLoggedIn:", isLoggedIn);
    console.log("role:" , role);
    //================================================================================================

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
  };

    // idea source: https://stackoverflow.com/questions/75994591/search-for-specific-item-from-axios-request
    const onChangeHandler = (event) => {
      console.log("typing:", event.target.value);
      console.log("typing length:", event.target.value.length);

      showSuggestions(event.target.value);
      setSearchTerm(event.target.value);
      
    }

    const HandleSearch = (term) => {
      console.log("search term length:", term.length);
      if (term.length > 0) {
        setSuggestions([]);
        navigate("/searchresult/" + term);
      }
    }

    // navigate to search result page with the clicked suggestion
    const showSuggestions = (term) =>{
      console.log("showSuggestions:", term);
      axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Product?where=(Name,like," + term +")", {headers: headers})
      .then((response) => {
        setSuggestions (response.data.list);
      });
      console.log("suggestions:", suggestions);
    }
  
    const onClickSuggestion = (item) => {
      console.log("click:", item);
      // navigate to product page
      navigate("/searchresult/" + item);
      setSuggestions([]);
    }

    // source: https://www.youtube.com/watch?v=HfZ7pdhS43s
    let ref = useRef();
    useEffect(() => {
      let handler = (event) => { 
        if (!ref.current.contains(event.target)) {
          setSuggestions([]);
        }
    }
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    }
  });


    return (
        <nav className="nav">
          {/*brand logo (initial WxH: 346x146) */}                
          <div><NavLink to = "/"><img alt ="logo" style={{width: 260, height: 150}} src={logo}/> </NavLink> </div>
          <form >
            {/*search suggestion source: https://www.youtube.com/watch?v=Jd7s7egjt30 */}
            <div className="searchContainer" ref={ref}> 
              <div className="searchBar">
              <div style={{width: 500 + "px"}}>
                <Input id="search-bar" fullWidth label="Search Products"
                variant="outlined" 
                onChange={onChangeHandler} value={searchTerm}
                onKeyDown={(e) => {if (e.key === 'Enter')
                  { 
                    // avoid form submission
                    e.preventDefault();
                    HandleSearch(searchTerm)
                }}}
                />
              </div>
              <button type="button"  onClick={() => HandleSearch(searchTerm)}><img className="searchBtn" src={searchIcon} /></button>
              </div>
              {/* if search term not empty, show suggestions dropdown */}
              {searchTerm.length > 0?
              <div className="dropdown">
                {suggestions.map((s) =>
                  <div className="dropdownRow" onClick={()=> onClickSuggestion(s.Name)}>
                    <p>{s.Name}</p>
                  </div>
                )}
              </div> :null}
            </div>                
          </form>
          <ul className="nav-links">
            {role === "Admin" ?
              <li>
                <NavLink to="/AdminDashboard">
                  <AdminPanelSettingsIcon fontSize="large" />
                  </NavLink>
                  </li> : null}
                <li>
                    <NavLink to="/ShoppingCart">
                        <ShoppingCartIcon fontSize="large" />
                    </NavLink>
                </li>
                <li>
                    <NavLink to={isLoggedIn ? `/detail/${userID}` : '/login'}>
                        <PersonIcon fontSize="large" />
                    </NavLink>
                </li>
                {isLoggedIn && role === "Customer" ? 
                <li>
                    <NavLink to="/" onClick={() => { auth.logOut()}}>
                        <LogoutIcon fontSize="large" />
                    </NavLink>
                    </li> : null}
            </ul>
        </nav>
    )
  }
export default Header;
