//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is the Customer Management page, where the admin can add, edit or delete customer information
//Last modified: 11/03/2024
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Alert } from '@mui/material';
import axios from 'axios';
import CryptoJS from 'crypto-js';

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

const CustomerManagement = () => {
    // Define headers for POST request
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
    };

    // Generate a random salt
    const generateSalt = () => {
        return CryptoJS.lib.WordArray.random(128 / 8).toString();
    }

    const [customerList, setCustomerList] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPassword, setCustomerPassword] = useState('');
    const [customerTO, setCustomerTO] = useState({});
    const [customerStreetAddress, setCustomerStreetAddress] = useState('');
    const [customerPostCode, setCustomerPostCode] = useState('');
    const [customerSuburb, setCustomerSuburb] = useState('');
    const [customerState, setCustomerState] = useState('');
    const [nameError, setNameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [postcodeError, setPostcodeError] = useState(false);
    const [duplicateEmailError, setDuplicateEmailError] = useState(false);

    // Fetch the list of customers from Docker
    const fetchCustomerList = async () => {
        axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons?limit=1000", { headers: headers })
            .then((response) => {
                console.log("Axios response from Customers: ", response);
                setCustomerList(response.data.list);
            });
    };

    // Fetch the list of customers on page load
    useEffect(() => {
        // eslint-disable-next-line
        fetchCustomerList();
        // eslint-disable-next-line
    }, []);

    const handleAddCustomer = () => {
        console.log("Add Customer button clicked");
        setCustomerName("");
        setCustomerEmail("");
        setOpenAddDialog(true);
    };

    const handleEditCustomer = async (id) => {
        console.log(`Edit Customer button clicked for customer ${id}`);
        const customer = customerList.find((customer) => customer.UserID === id); // Find the customer object
        setCurrentCustomer(customer);
        setCustomerName(customer.Name);
        setCustomerEmail(customer.Email);
        
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/db/data/v1/inft3050/TO?where=(PatronId,eq,${id})`, { headers: headers });
            if (response.data.list && response.data.list.length > 0) {
                setCustomerTO(response.data.list[0]);
                console.log("TO data: ", customerTO);
            } else {
                setCustomerTO('');
            }
        } catch (error) {
            console.error("Error fetching data from TO table: ", error);
            setCustomerTO('');
        }

        setOpenEditDialog(true);
    };

    const handleDeleteCustomer = (id) => {
        console.log(`Delete Customer button clicked for customer ${id}`);
        setCurrentCustomer(id);
        setOpenDeleteDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setCustomerName('');    
        setCustomerEmail('');
        setCustomerPassword('');
        setNameError(false);
        setEmailError(false);
        setPasswordError(false);
    };
    
    const handleCloseEditDialog = () => {
        setCurrentCustomer(null);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerStreetAddress('');
        setCustomerPostCode('');
        setCustomerSuburb('');
        setCustomerState('');
        setOpenEditDialog(false);
    };
    
    const handleCloseDeleteDialog = () => {
        setCurrentCustomer(null);
        setOpenDeleteDialog(false);
    };

    const handleSaveAdd = async (event) => {
        event.preventDefault();

        // Check for duplicate email
        try {
            const existingUserResponse = await axios.get(`http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons?where=(Email,eq,${customerEmail})`, { headers: headers });
            if (existingUserResponse.data.list.length > 0) {
                setDuplicateEmailError(true);
                return;
            }
        } catch (error) {
            console.error("Error checking existing user", error);
            return;
        }

        // Generate a random salt and hash the password
        const salt = generateSalt();
        const hashPW = await sha256(salt + customerPassword);
        // Create a new customer data object
        const customerData = {
            "Name": customerName,
            "Email": customerEmail,
            "Salt": salt,
            "HashPW": hashPW
        };
    
        try {
            // Post the new customer data to Patrons table
            const postResponse = await axios.post("http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons", customerData, { headers: headers });
            console.log("Axios response from post: ", postResponse);
            fetchCustomerList(); // Refresh the list after saving
    
            // Get the new customer ID
            const getResponse = await axios.get(`http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons?where=(Email,eq,${customerEmail})`, { headers: headers });
            console.log("Axios response from get: ", getResponse);

            // Check if the user exists in the Patrons table
            if (getResponse.data.list && getResponse.data.list.length > 0) {
                const newUserID = getResponse.data.list[0].UserID;
    
                // Post the new user TO
                const newUserTO = {
                    "Email": customerEmail,
                    "PatronId": newUserID
                };
    
                const toResponse = await axios.post("http://localhost:8080/api/v1/db/data/v1/inft3050/TO", newUserTO, { headers: headers });
                console.log("Axios response from TO post: ", toResponse);
            } else {
                console.error("Error: No user found with the given email.");
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    
        handleCloseAddDialog();
    };

    const handleSaveEdit = (event) => {
        event.preventDefault();
        const customerData = {
            "Name": customerName,
            "Email": customerEmail
        };  
        // Create a new TO data object
        const toData = {
            "Email": customerEmail,
            "StreetAddress": customerStreetAddress,
            "PostCode": customerPostCode,
            "Suburb": customerSuburb,
            "State": customerState
        };
        // Patch the customer data to Patrons table
        axios.patch(`http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons/${currentCustomer.UserID}`, customerData, { headers: headers })
            .then((response) => {
                console.log("Axios response from patch: ", response);
                fetchCustomerList(); // Refresh the list after saving
            })
            .catch((error) => {
                console.error("Error: ", error);
            });
        // Patch the TO data to TO table
        axios.patch(`http://localhost:8080/api/v1/db/data/v1/inft3050/TO/${customerTO.CustomerID}`, toData, { headers: headers })
            .then((response) => {
                console.log("Axios response from TO patch: ", response);
            })
        handleCloseEditDialog();
    };

    const handleConfirmDelete = async () => {
        try {
            // Fetch the UserID from the Patrons table
            const getResponse = await axios.get(`http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons?where=(PatronId,eq,${currentCustomer})`, { headers: headers });
            const UserID = getResponse.data.list[0].UserID;
            console.log("UserID: ", UserID);

            // Delete the entry in the Patrons table
            await axios.delete(`http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons/${currentCustomer}`, { headers: headers });

            // Delete the corresponding entry in the TO table
            await axios.delete(`http://localhost:8080/api/v1/db/data/v1/inft3050/TO/${UserID}`, { headers: headers });
    
            // Refresh the list after deleting
            fetchCustomerList();
        } catch (error) {
            console.error("Error: ", error);
        }
    
        handleCloseDeleteDialog();
    };

    const handleNameChange = (event) => {
        console.log(event.target.value);
        setCustomerName(event.target.value);
        if (event.target.value.length < 3){
            setNameError("Name must be at least 3 characters long");
        } else if (event.target.value.length > 20) {
            setNameError("Name must be less than 20 characters long");
        } else if (!/^[a-zA-Z ]+$/.test(event.target.value)) {
            setNameError("Name must contain only letters and spaces");
        } else {
            setNameError(false);
        }
    }

    const handleEmailChange = (event) => {
        console.log(event.target.value);
        setCustomerEmail(event.target.value);
        if (!/^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$/.test(event.target.value)) {
            setEmailError("Invalid email address");
        } else {
            setEmailError(false);
        }
    }

    const handlePasswordChange = (event) => {
        console.log(event.target.value);
        setCustomerPassword(event.target.value);
        if (event.target.value.length < 8) {
            setPasswordError("Password must be at least 8 characters long");
        } else {
            setPasswordError(false);
        }
    }

    const handlePostcodeChange = (event) => {
        console.log(event.target.value);
        setCustomerPostCode(event.target.value);
        //Check if postcode meets condition
        if (!/^[0-9]+$/.test(event.target.value)){
            setPostcodeError("Postcode must contain only numbers");
        } else if (event.target.value.length !== 4) {
            setPostcodeError("Invalid postcode");
        } else {
            setPostcodeError(false);
        }
    }

    return (
        <div className='mainBodyAdminFunction'>
            <h1>Customer Management</h1>
            <Button variant="contained" color="primary" onClick={handleAddCustomer}>
                Add Customer
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customerList.map((customer) => (
                            <TableRow key={customer.UserID}>
                                <TableCell>{customer.UserID}</TableCell>
                                <TableCell>{customer.Name}</TableCell>
                                <TableCell>{customer.Email}</TableCell>
                                <TableCell>
                                    <Button variant="contained" style={{ backgroundColor: '#3A83BB' }} onClick={() => handleEditCustomer(customer.UserID)}>
                                        Edit
                                    </Button>
                                    <Button variant="contained" color="error" onClick={() => handleDeleteCustomer(customer.UserID)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Customer Dialog */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
                <DialogTitle>Add New Customer Account</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the details for the new customer below.
                    </DialogContentText>
                    {duplicateEmailError && <Alert severity="error">Email already exists. Please use a different email.</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Customer Name"
                        type="text"
                        fullWidth
                        value={customerName}
                        onChange={handleNameChange}
                        error={!!nameError}
                        helperText={nameError}
                    />
                    <TextField
                        margin="dense"
                        label="Customer Email"
                        type="email"
                        fullWidth
                        value={customerEmail}
                        onChange={handleEmailChange}
                        error={!!emailError}
                        helperText={emailError}
                    />
                    <TextField
                        margin="dense"
                        label="Customer Password"
                        type="password"
                        fullWidth
                        value={customerPassword}
                        onChange={handlePasswordChange}
                        error={!!passwordError}
                        helperText={passwordError}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveAdd} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Customer Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>Edit {currentCustomer?.Name}'s Account</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Make changes to the customer details below.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Customer Name"
                        type="text"
                        fullWidth
                        value={customerName}
                        onChange={handleNameChange}
                        error={!!nameError}
                        helperText={nameError}
                    />
                    <TextField
                        margin="dense"
                        label="Customer Email"
                        type="email"
                        fullWidth
                        value={customerEmail}
                        onChange={handleEmailChange}
                        error={!!emailError}
                        helperText={emailError}
                    />
                    <TextField
                        margin="dense"
                        label="Street Address"
                        type="text"
                        fullWidth
                        value={customerTO.StreetAddress}
                        onChange={(e) => setCustomerStreetAddress(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Post Code"
                        type="text"
                        fullWidth
                        value={customerTO.PostCode}
                        onChange={handlePostcodeChange}
                        error={!!postcodeError}
                        helperText={postcodeError}
                    />
                    <TextField
                        margin="dense"
                        label="Suburb"
                        type="text"
                        fullWidth
                        value={customerTO.Suburb}
                        onChange={(e) => setCustomerSuburb(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="State"
                        type="text"
                        fullWidth
                        value={customerTO.State}
                        onChange={(e) => setCustomerState(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Delete Customer</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this customer account?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CustomerManagement;
