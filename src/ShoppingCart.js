//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for the shopping cart page of the application
//Last modified: 11/03/2024
import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { removeItemFromCart, totalAmount, decreaseItem, increaseItem, clearCart } from './helpers/cartSlice';
import './ShoppingCart.css'
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const ShoppingCart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
    const cart = useSelector((state) => state.cart);
    const [open, setOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);

    const [customerID, setCustomerID] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [suburb, setSuburb] = useState("");
    const [postcode, setPostcode] = useState("");
    const [state, setState] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardOwner, setCardOwner] = useState("");
    const [postcodeError, setPostcodeError] = useState(false);
    const [cardNoError, setCardNoError] = useState(false);
    const [cvvError, setCVVError] = useState(false);
    const [formError, setFormError] = useState('');


    const { userID } = useSelector((state) => state.auth);

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
    };

    //Get the cart amount and cart item from Redux store
    const cartAmount = useSelector((state) => state.cart.cartAmount);
    const cartItem = useSelector((state) => state.cart.cartItem);
    //Calculate the total amount of the cart
    useEffect(() => {
        dispatch(totalAmount());
    }, [cartItem, dispatch])


    const HandleRemoveItem = (item) => {
    dispatch(removeItemFromCart(item));
}

    const HandleDecrease = (item) => {
        dispatch(decreaseItem(item));
    }

    const HandleIncrease = (item) => {
        dispatch(increaseItem(item));
    }

    const fetchCustomerDetails = () => {
        axios.get(`http://localhost:8080/api/v1/db/data/v1/inft3050/TO?where=(PatronId,eq,${userID})`, { headers: headers })
        .then((response) => {
            console.log("Axios response from TO: ", response.data.list);
            setCustomerID(response.data.list[0].CustomerID);
            setShippingAddress(response.data.list[0].StreetAddress);
            setCardNumber(response.data.list[0].CardNumber);
            setSuburb(response.data.list[0].Suburb);
            setPostcode(response.data.list[0].PostCode);
            setState(response.data.list[0].State);
            setCvv(response.data.list[0].CVV);
            setCardOwner(response.data.list[0].CardOwner);
        })
        .catch((error) => {
            console.error("Error fetching customer details: ", error);
        });
    };

    const handleCheckout = () => {
        fetchCustomerDetails();
        // Open the dialog
        setOpen(true);


    };

    const handleClose = () => {
        // Close the dialog
        setOpen(false);
        setShippingAddress("");
        setCardNumber("");
        setSuburb("");
        setPostcode("");
        setState("");
        setCvv("");
        setCardOwner("");
        setPostcodeError(false);
        setCardNoError(false);
        setCVVError(false);
    };

    const handleSuccessClose = () => {
        // Close the success dialog
        setSuccessOpen(false);
        navigate('/');
        dispatch(clearCart());
    };

    const handleConfirmCheckout = () => {
        // Handle the checkout process
        // preventDefault();
        if (!shippingAddress || !suburb|| !postcode || !state || !cardNumber || !cvv || !cardOwner) {  
            setFormError("All fields are required");
            console.log("missing fields");
            return;
        } 

        setFormError("");

        console.log("Checkout confirmed");

        // Send the order to the backend
        const order = {
            "Customer": customerID,
            "StreetAddress": shippingAddress,
            "PostCode": postcode,
            "Suburb": suburb,
            "State": state,
        };

        axios.post("http://localhost:8080/api/v1/db/data/v1/inft3050/Orders", order, { headers: headers })
        .then((response) => {
            console.log("Order response: ", response.data);
            setSuccessOpen(true);
        }).catch((error) => {
            console.error("Error creating order: ", error);
        });
        
        // Close the dialog
        setOpen(false);
        setShippingAddress("");
        setCardNumber("");
        setSuburb("");
        setPostcode("");
        setState("");
        setCvv("");
        setCardOwner("");
        setPostcodeError(false);
        setCardNoError(false);
        setCVVError(false);
    };
    
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

    const handleCardNoChange = (event) => {
        console.log(event.target.value);
        setCardNumber(event.target.value);
        //Check card number if meets condition
        if (event.target.value.length !== 16){
            setCardNoError("Please input card number");
        } else if (!/^[0-9]+$/.test(event.target.value)) {
                setCardNoError("Card number must only contains numbers");
        } else {
                setCardNoError(false);
            }
    }

    const handleCVVChange = (event) => {
        console.log(event.target.value);
        setCvv(event.target.value);
        //Check if CVV number meets condition
        if (event.target.value.length !== 3){
            setCVVError("CVV invalid");
        } else if (!/^[0-9]+$/.test(event.target.value)) {
                setCVVError("CVV must only contains numbers");
        } else {
                setCVVError(false);
            }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (shippingAddress=="" || suburb==""|| postcode=="" || state=="" || cardNumber=="" || cvv=="" || cardOwner=="") {  
            setFormError("All fields are required");
            return;
        } 

        setFormError("");
    }
    return(
        <>
        <h1 style={{justifySelf: "center", marginBottom: 20 + "px", fontSize: 60 + "px", fontWeight:"bolder"}}>Shopping Cart</h1>
        {/* show empty cart if no item */}
        {cartItem.length === 0 ?  
        <h1 style={{justifySelf: "center", fontSize: 35 + "px", fontWeight:"lighter"}}>Your cart is Empty</h1>:
        // show cart items
        <div className="cart"> {cartItem.map((cartItem) => (
            <div  className="productContainer" key={cartItem.ID}>
                {/* <Checkbox {...label} defaultChecked /> */}
                    <img className="productImg" src="https://www.newcastle.edu.au/__data/assets/image/0011/246881/uon-logo-square.png" />
                    <div className="itemInfo">
                        <p className="cartItemName" >{cartItem.Product.Name} </p>
                        <p className="cartItemVer">Version: {cartItem.Source.SourceName}</p>
                        <p className="cartItemPrice">Price: ${cartItem.Price}</p>
                        <div className="qtyControl"> 
                            <div className="changeQty"> 
                                <button className="qtyBtn" onClick={()=> HandleDecrease(cartItem)}>-</button>
                                <p>{cartItem.quantity}</p>
                                <button className="qtyBtn" onClick={()=> HandleIncrease(cartItem)}>+</button>
                            </div>
                            <button className="removeBtnCart" onClick={()=> HandleRemoveItem(cartItem)}>remove</button>
                        </div>
                    </div>
                </div>
            ))}
            <div className="cartTotal" >
                <p>Total: ${cart.cartAmount.toFixed(2)}</p>
                <Button variant="contained" color="primary" onClick={handleCheckout}>Checkout</Button>
            </div>
            <form onSubmit={handleSubmit}>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Review Your Information</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please review your shipping address and payment information before checking out.
                    </DialogContentText>
                    
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Shipping Address"
                            type="text"
                            fullWidth
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Suburb"
                            type="text"
                            fullWidth
                            value={suburb}
                            onChange={(e) => setSuburb(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Postcode"
                            type="number"
                            fullWidth
                            value={postcode}
                            onChange={handlePostcodeChange}
                            error={!!postcodeError}
                            helperText={postcodeError ? "Postcode must be 4 digits and contain only numbers" : ""}
                        />
                        <TextField
                            margin="dense"
                            label="State"
                            type="text"
                            fullWidth
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Card Number"
                            type="number"
                            fullWidth
                            value={cardNumber}
                            onChange={handleCardNoChange}
                            error={!!cardNoError}
                            helperText={cardNoError ? "Card number must be 16 digits and contain only numbers" : ""}
                        />
                        <TextField
                            margin="dense"
                            label="Card Owner"
                            type="text"
                            fullWidth
                            value={cardOwner}
                            onChange={(e) => setCardOwner(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="CVV"
                            type="password"
                            fullWidth
                            value={cvv}
                            onChange={handleCVVChange}
                            error={!!cvvError}
                            helperText={cvvError ? "CVV must be 3 digits and contain only numbers" : ""}
                        />
                    {formError && <p style={{ color: 'red' }}>{formError}</p>}
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmCheckout} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            </form>
            <Dialog open={successOpen} onClose={handleSuccessClose}>
                <DialogTitle>Order Placed Successfully</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Your order has been placed successfully. Thank you for shopping with us!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSuccessClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>}
        </>
        )
}

export default ShoppingCart;
