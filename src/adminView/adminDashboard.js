//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is the Admin Dashboard page, where the admin can choose to edit customer, staff or item information
//Last modified: 11/03/2024
import * as React from 'react';
import { Button } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom'; 

const AdminDashboard = () => {
    // Initialize the auth and navigate hooks
    const auth = useAuth(); 
    const navigate = useNavigate(); 

    const handleCustomerEdit = () => {
        console.log("Customer Edit button clicked");
    };

    const handleAdminEdit = () => {
        console.log("Admin Edit button clicked");
    };
    
    const handleItemEdit = () => {
        console.log("Item Edit button clicked");
    };

    return (
        <div className="mainBodyAdmin">
            <h1>Admin Dashboard</h1>
            <h2>Please select an action below</h2>
            <nav className='navLinkAdmin'>
            <NavLink to="/CustomerManagement">
                <Button variant="contained" color="primary" onClick={handleCustomerEdit}>
                    Edit Customer
                </Button>
            </NavLink>
            <NavLink to="/StaffManagement">
                <Button variant="contained" color="primary" onClick={handleAdminEdit}>
                    Edit Staff
                </Button>
            </NavLink>
            <NavLink to="/ItemManagement">
                <Button variant="contained" color="primary" onClick={handleItemEdit}>
                    Edit Item
                </Button>
            </NavLink>
            <div>
                <Button 
                    variant="contained" 
                    color="error" 
                    onClick={() => { auth.logOut(); navigate('/'); }} // Log out and navigate to the home page
                >
                    Log Out
                </Button>
            </div>
            </nav>
        </div>
    );
};

export default AdminDashboard;
