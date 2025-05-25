//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for the detail page of the website, where users can view and edit their personal information, shipping details and payment details
//Last modified: 11/03/2024
import './Detail.css';
import {  TextField, Input, FormControl, FormGroup, Button, Box, Table, Paper, TableContainer, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import * as React from 'react';
import axios from "axios";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Detail = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    //Get the userID from the URL parameter ie. Redux
    const { userID } = useSelector((state) => state.auth);
    const [ userIDTO, setUserIDTO ] = useState("");

    //For controlled form components
    const [accountNo, setAccNo] = useState("");
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [phoneNo, setPhoneNo] = useState("");
    const [phoneNoError, setPhoneNoError] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [postcode, setPostcode] = useState("");
    const [postcodeError, setPostcodeError] = useState("");
    const [suburb, setSuburb] = useState("");
    const [state, setState] = useState("");
    const [cardNo, setCardNo] = useState("");
    const [cardNoError, setCardNoError] = useState("");
    const [cardOwner, setCardOwner] = useState("");
    const [expiry, setExpiry] = useState("");
    const [CVV, setCVV] = useState("");
    const [CVVError, setCVVError] = useState("");

    //Headers for the GET request
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
    }

    useEffect (() => { 
        //Send a GET request to TO table
        axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/TO?where=(PatronId,eq," + userID + ")", {headers: headers})
        .then((response) => {
            console.log(response.data);
            //Get TO ID
            console.log(response.data.list[0].CustomerID);
            setUserIDTO(response.data.list[0].CustomerID);
            //Get personal information
            setEmail(response.data.list[0].Email);
            setPhoneNo(response.data.list[0].PhoneNumber);
            
            //Get shipping details
            setStreetAddress(response.data.list[0].StreetAddress);
            setPostcode(response.data.list[0].PostCode);
            setSuburb(response.data.list[0].Suburb);
            setState(response.data.list[0].State);

            //Get payment details
            setCardNo(response.data.list[0].CardNumber);
            setCardOwner(response.data.list[0].CardOwner);
            setExpiry(response.data.list[0].Expiry);
            setCVV(response.data.list[0].CVV);

        }).catch(() => console.log("Error"));

        //Send a GET request to Patrons table
        axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons/" + userID, {headers: headers})
        .then((response) => {
            //Get personal information
            setName(response.data.Name);
        }).catch(() => console.log("Error"));
        
        //Send a GET request to get the TO ID from the Patrons table, then fetch the order data from the Orders table using the TO ID
        axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons/" + userID + "?fields=TO List&nested[TO List][fields]=CustomerID", {headers: headers})
        .then((response) => {
            console.log("to id",response.data['TO List'][0].CustomerID);
            fetchOrderData(response.data['TO List'][0].CustomerID);
        })
    }, []);

    const [orderData, setOrderData] = useState([]);

    //Fetch order data from the Orders table using the TO ID
    const fetchOrderData = async (ID) => {
        try{
            const response = await axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Orders?where=(Customer,eq," + ID + ")&ields=Stocktake List&nested[Stocktake List][fields]=ItemId", {headers: headers})
            console.log("stocktake id", response.data.list[0]['Stocktake List'].ItemId);
            const stocktakeID = [];
            for (let i=0; i<response.data.list[0]['Stocktake List'].length; i++) {
                console.log("stocktake id", response.data.list[0]['Stocktake List'][i].ItemId);
                stocktakeID.push(response.data.list[0]['Stocktake List'][i].ItemId);
            }
            console.log("stocktake id", stocktakeID);
            const stocktakeData = [];

            //Fetch stocktake data from the Stocktake table using the stocktake ID
            for (let j=0; j<stocktakeID.length; j++) {
                try{
                const stocktakeRepsonse = await axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake/" + stocktakeID[j], {headers: headers})
                .then((response) => {
                console.log("stocktake data", response.data);
                stocktakeData.push(response.data);
                });
            } catch (error) { 
                console.error("error", error);
            }}
            setOrderData(stocktakeData);
        
    } catch (error) {
        console.error("error", error);
    }}

    //Calculate the total items and subtotal of the order
    const subtotal = orderData.reduce((acc, order) => acc + (order.Price || 0), 0);
    const totalItems = orderData.length;

    //Prevent default reloading of page
    const handleSubmit = (event) => {
        event.preventDefault();

        //Check if there are any errors in the form
        if (nameError || emailError || phoneNoError || postcodeError || cardNoError || CVVError) {
            alert("Please fix the errors before submitting.");
            return;
        }

        console.log(event.target);

        //Declare Object for update the TO and Patrons table
        let updateDataTO = {       
            "Email": email,
            "PhoneNumber": phoneNo,
            "StreetAddress": streetAddress,
            "PostCode": postcode,
            "Suburb": suburb,
            "State": state,
            "CardNumber": cardNo,
            "CardOwner": cardOwner,
            "Expiry": expiry,
            "CVV": CVV
        };

        //Declare Object for update the Patrons table
        let updateDataPatrons = {
            "Email": email,
            "Name": name
        };

        //Send a PATCH request to update the TO and Patrons table
        axios.patch("http://localhost:8080/api/v1/db/data/v1/inft3050/TO/" + userIDTO, updateDataTO, {headers: headers})
        .then((response) => {
          console.log(response);
            console.log("Updated TO table");
        })
        .catch((error) => console.log("Something went wrong"));
        
        axios.patch("http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons/" + userID, updateDataPatrons, {headers: headers})
        .then((response) => {
            console.log(response);
            console.log("Updated Patrons table");
        })
    }

    //Check if name input is in correct format
    //Source: https://muhimasri.com/blogs/mui-validation/
    const handleNameChange = (event) => {
        console.log(event.target.value);
        setName(event.target.value);
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

    //Check if email input is in correct format
    //Source: https://muhimasri.com/blogs/mui-validation/
    const handleEmailChange = (event) => {
        console.log(event.target.value);
        setEmail(event.target.value);
        if (!/^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$/.test(event.target.value)) {
            setEmailError("Invalid email address");
        } else {
            setEmailError(false);
        }
    }

    //Check if phone number input is in correct format
    const handlePhoneNoChange = (event) => {
        console.log(event.target.value);
        setPhoneNo(event.target.value);
        //Check if phone number meets condition
        if (event.target.value.length !== 10){
            setPhoneNoError("Please input phone number");
        } else if (!/^[0-9]+$/.test(event.target.value)) {
                setPhoneNoError("Phone number must only contains numbers");
        } else {
                setPhoneNoError(false);
            }
    }

    const handleStreetAddressChange = (event) => {
        console.log(event.target.value);
        setStreetAddress(event.target.value);
    }

    //Check if postcode input is in correct format
    const handlePostcodeChange = (event) => {
        console.log(event.target.value);
        setPostcode(event.target.value);
        //Check if postcode meets condition
        if (!/^[0-9]+$/.test(event.target.value)){
            setPostcodeError("Postcode must contain only numbers");
        } else if (event.target.value.length !== 4) {
            setPostcodeError("Invalid postcode");
        } else {
            setPostcodeError(false);
        }
    }

//     const [value, setValue] = useState('');
//     const handleChange = (event) => {
//     const inputValue = event.target.value;
//     // Regex to match MM/YY format
//     if (/^(0[1-9]|1[0-2])\/\d{2}$/.test(inputValue) || inputValue === '') {
//       setValue(inputValue);
//     }
//   };

    const handleSuburbChange = (event) => {
        console.log(event.target.value);
        setSuburb(event.target.value);
    }

    const handleStateChange = (event) => {
        console.log(event.target.value);
        setState(event.target.value);
    }

    //Check if card number input is in correct format
    const handleCardNoChange = (event) => {
        console.log(event.target.value);
        setCardNo(event.target.value);
        //Check card number if meets condition
        if (event.target.value.length !== 16){
            setCardNoError("Please input card number");
        } else if (!/^[0-9]+$/.test(event.target.value)) {
                setCardNoError("Card number must only contains numbers");
        } else {
                setCardNoError(false);
            }
    }

    const handleCardOwnerChange = (event) => {
        console.log(event.target.value);
        setCardOwner(event.target.value);
    }

    const handleExpiryChange = (event) => {
        console.log(event.target.value);
        setExpiry(event.target.value);
    }

    //Check if CVV input is in correct format
    const handleCVVChange = (event) => {
        console.log(event.target.value);
        setCVV(event.target.value);
        //Check if CVV number meets condition
        if (event.target.value.length !== 3){
            setCVVError("CVV invalid");
        } else if (!/^[0-9]+$/.test(event.target.value)) {
                setCVVError("CVV must only contains numbers");
        } else {
                setCVVError(false);
            }
    }
    
//*********************************************************************** 

    return(
        <>
        <form method='post' onSubmit={handleSubmit}>
            <div className='infoContainer'>
                <div className='info' style={{ marginTop: 50 + 'px' }}>
                    <h1>My Detail</h1>
                    <div className='infoField'>
                        <div className='infoInput'>
                            <FormGroup>
                                <TextField 
                                    margin='none' 
                                    id="name-field" 
                                    label="Name" 
                                    variant='outlined' 
                                    fullWidth
                                    value={name} 
                                    onChange={handleNameChange}
                                    error={!!nameError}
                                    helperText={nameError ? "Name must be at least 3 characters long and contain only letters and spaces" : ""}
                                />
                            </FormGroup>
                            <FormGroup>
                                <TextField 
                                    margin='none' 
                                    id='email-field' 
                                    label="Email" 
                                    variant='outlined' 
                                    fullWidth
                                    value={email} 
                                    onChange={handleEmailChange}
                                    error={!!emailError}
                                    helperText={emailError ? "Invalid email address" : ""}
                                />
                            </FormGroup>
                            <FormGroup>
                                <TextField 
                                    margin='none' 
                                    id='phoneNo-field' 
                                    label="Phone number" 
                                    variant='outlined' 
                                    fullWidth
                                    value={phoneNo} 
                                    onChange={handlePhoneNoChange}
                                    error={!!phoneNoError}
                                    helperText={phoneNoError ? "Phone number must be 10 digits and contain only numbers" : ""}
                                />
                            </FormGroup>
                        </div>
                    </div>
                </div>

                <div className='info'>
                    <h1>Shipping Details</h1>
                    <div className='infoField'>
                        <div className='infoInput'>
                            <FormGroup>
                                <TextField 
                                    margin='none' 
                                    id="address-field" 
                                    label="Address" 
                                    variant='outlined' 
                                    fullWidth
                                    value={streetAddress}
                                    onChange={handleStreetAddressChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <TextField 
                                    margin='none' 
                                    id="postcode-field" 
                                    label="Postcode" 
                                    variant='outlined' 
                                    fullWidth
                                    value={postcode}
                                    onChange={handlePostcodeChange}
                                    error={!!postcodeError}
                                    helperText={postcodeError ? "Postcode must be 4 digits and contain only numbers" : ""}
                                />
                            </FormGroup>
                            <FormGroup>
                                <TextField 
                                    margin='none' 
                                    id='suburb-field' 
                                    label="Suburb" 
                                    variant='outlined' 
                                    fullWidth
                                    value={suburb}
                                    onChange={handleSuburbChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <TextField 
                                    margin='none' 
                                    id='state-field' 
                                    label="State" 
                                    variant='outlined' 
                                    fullWidth
                                    value={state}
                                    onChange={handleStateChange}
                                />
                            </FormGroup>
                        </div>
                    </div>
                </div>

                <div className='info'>
                    <h1>Payment Details</h1>
                    <div className='infoField'>
                        <div className='infoInput'>
                            <FormGroup>
                                <TextField 
                                    margin='none' 
                                    id="cardNo-field" 
                                    label="Card number" 
                                    variant='outlined' 
                                    fullWidth
                                    value={cardNo}
                                    onChange={handleCardNoChange}
                                    error={!!cardNoError}
                                    helperText={cardNoError ? "Card number must be 16 digits and contain only numbers" : ""}
                                />
                            </FormGroup>
                            <FormGroup>
                                <TextField 
                                    margin='none' 
                                    id="CardOwner-field" 
                                    label="Card Owner" 
                                    variant='outlined' 
                                    fullWidth
                                    value={cardOwner}
                                    onChange={handleCardOwnerChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <TextField 
                                    margin='none' 
                                    id='expiry-field' 
                                    label="Expiry" 
                                    variant='outlined' 
                                    fullWidth
                                    value={expiry}
                                    placeholder='MM/YY'
                                    inputProps={{ maxLength: 5 }}
                                    onChange={handleExpiryChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <TextField 
                                    type='password'
                                    margin='none' 
                                    id='CVV-field' 
                                    label="CVV" 
                                    variant='outlined' 
                                    fullWidth
                                    value={CVV}
                                    onChange={handleCVVChange}
                                    error={!!CVVError}
                                    helperText={CVVError ? "CVV must be 3 digits and contain only numbers" : ""}
                                />
                            </FormGroup>
                        </div>
                    </div>
                </div>

                <Box className="buttonBox">
                    <div className='saveButton'>
                        <Button type="submit" variant="contained" color='success'>Save</Button>
                    </div>
                    <div className='cancelButton'>
                        <Button variant="contained" color='error'><Link to="/" style={{ textDecoration: 'none', color: 'white' }}>Cancel</Link></Button>
                    </div>
                </Box>
            </div>
        </form>

<h1 style={{justifySelf: "center"}}>Order History</h1>
{orderData.length === 0 ? <p style={{justifySelf: "center", fontSize: 20 + "px", marginTop: -15 + "px"}}>No order history</p> :
        <div className='orderHistoryTable'>
            
            
            <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Item Name</TableCell>
                                <TableCell>Source</TableCell>
                                <TableCell>Price</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orderData.map((order) => (
                                <TableRow key={order.ItemId}>
                                    <TableCell>{order.Product?.Name || "N/A"}</TableCell>
                                    <TableCell>{order.Source?.SourceName || "N/A"}</TableCell>
                                    <TableCell>${order.Price}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div className="orderSummary">
                    <p>Total Items: {totalItems}<br />Subtotal: ${subtotal.toFixed(2)}</p>
                </div>
        </div>}
    </>
    );
}


export default Detail;
