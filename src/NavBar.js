//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for the navigation bar of the application
//Last modified: 11/03/2024
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
    return(
        <nav className='navbar'>
            <div>
                <ul className='menu'>
                    {/* filter */}
                    {/* source: https://medium.com/@alexanie_/navlink-component-in-react-router-b83f4a11794f */}
                    <li>
                        <NavLink to = "/" style={({ isActive }) => {
                        return isActive ? { color: "white", backgroundColor: "#071108", width: 2.45 + "cm", height: 0.4 +"cm" } : {};
                        }}>Home</NavLink>
                    </li>
                    <li>
                        <NavLink to = "/book" style={({ isActive }) => {
                        return isActive ? { color: "white", backgroundColor: "#071108", width: 2.45 + "cm", height: 0.4 +"cm" } : {};
                        }}>Books</NavLink>
                    </li>
                    <li>
                        <NavLink to = "/movie" style={({ isActive }) => {
                        return isActive ? { color: "white", backgroundColor: "#071108", width: 2.45 + "cm", height: 0.4 +"cm"  } : {};
                        }}>Movies</NavLink>
                    </li>
                    <li>
                        <NavLink to = "/game" style={({ isActive }) => {
                        return isActive ? { color: "white", backgroundColor: "#071108", width: 2.45 + "cm", height: 0.4 +"cm"  } : {};
                        }}>Games</NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default NavBar;
