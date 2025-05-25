//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for the sign up page of the application
//Last modified: 11/03/2024
import * as React from 'react';
import { TextField, FormControl, Button, InputAdornment, IconButton, Alert } from "@mui/material";
import './LogIn.css';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import HandleLogin from './helpers/HandleLogin';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { useDispatch } from 'react-redux';
import { login } from './helpers/authSlice';

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

    //function to generate a random salt
    function generateSalt() {
        return CryptoJS.lib.WordArray.random(128 / 8).toString();
    }

const SignUp = () => {
    //define headers for POST request
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
    }

    const [newPassword, setNewPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newCustomerName, setNewCustomerName] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [result, setResult] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("success");
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();
    const auth = useAuth();
    const dispatch = useDispatch();



    async function handleSubmitEvent(event) {
        //Prevent reloading of page
        event.preventDefault();

        // Check if the email already exists
        try {
            const existingUserResponse = await axios.get(`http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons?where=(Email,eq,${newEmail})`, { headers: headers });
            if (existingUserResponse.data.list.length > 0) {
                setResult("User already exists");
                setAlertMessage("User already exists with this email.");
                setAlertSeverity("error");
                setShowAlert(true);
                return;
            }
        } catch (error) {
            console.error("Error checking existing user", error);
            setResult("Error checking existing user");
            setAlertMessage("Error checking existing user.");
            setAlertSeverity("error");
            setShowAlert(true);
            return;
        }

        //generate a random salt and hash the password
        const salt = generateSalt();
        const HashPW = await sha256(salt + newPassword);

        //Create a new user object for Patrons table
        const newUserPatrons = {
            "Name": newCustomerName,
            "Email": newEmail,
            "Salt": salt,
            "HashPW": HashPW
        };

        console.log("newUserPatrons: ", newUserPatrons);

        //POST request to create a new user in the Patrons table
        await axios.post("http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons", newUserPatrons,
            { headers: headers })
            .then((response) => {
                console.log(response);
                setResult("User created");
                setAlertMessage("User created successfully!");
                setAlertSeverity("success");
                setShowAlert(true);
            })
            .catch((error) => {
                console.error("error", error);
                setResult("Error creating user");
                setAlertMessage("Error creating user.");
                setAlertSeverity("error");
                setShowAlert(true);
                return;
            });

        //GET request to get the userID of the newly created user in Patrons table
        const { role, userID } = await HandleLogin(newEmail, newPassword);
        console.log("New userID: ", userID);

        //Create a new user object for TO table
        const newUserTO = {
            "Email": newEmail,
            "PatronId": userID
        };

        //if the userID is not null, perform POST request to create a new user in the TO table
        if (userID) {
            setResult("Authentication success!");
            const responseAxios = await axios.post("http://localhost:8080/api/v1/db/data/v1/inft3050/TO", newUserTO, { headers: headers });

            //dispatch the login action with the email, userID and role
            if (responseAxios)
                dispatch(login({ newEmail, userID, role }));

            //call the loginAction function from AuthProvider.js
            auth.loginAction(newEmail, userID);

            //navigate to the user detail page
            navigate(`/detail/${userID}`);
        }
        else {
            setResult("Authentication failed.");
            setAlertMessage("Authentication failed.");
            setAlertSeverity("error");
            setShowAlert(true);
        }
    }

    const handlePasswordChange = (event) => {
        setNewPassword(event.target.value);
        if (event.target.value.length < 8) {
            setPasswordError("Password must be at least 8 characters long");
        } else {
            setPasswordError("");
        }
    }
    const handleMailChange = (event) => {
        setNewEmail(event.target.value);
        if (!/^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$/.test(event.target.value)) {
            setEmailError("Invalid email address");
        } else {
            setEmailError("");
        }
    }
    const handleCustomerNameChange = (event) => {
        setNewCustomerName(event.target.value);
        if (event.target.value.length < 3) {
            setNameError("Name must be at least 3 characters long");
        } else if (event.target.value.length > 20) {
            setNameError("Name must be less than 20 characters long");
        } else if (!/^[a-zA-Z ]+$/.test(event.target.value)) {
            setNameError("Name must contain only letters and spaces");
        } else {
            setNameError("");
        }
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    }

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    }

    return (
        <>
            {showAlert && <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>{alertMessage}</Alert>}
            <form onSubmit={handleSubmitEvent}>
                <div className='LogInContainer'>
                    <div className='LogInForm'>
                        <h1> Create account </h1>

                        <FormControl sx={{ m: 1, width: 400 + 'px' }} variant="outlined">
                            <TextField
                                id="name-field"
                                label="Full Name"
                                variant='outlined'
                                onChange={handleCustomerNameChange}
                                value={newCustomerName}
                                error={!!nameError}
                                helperText={nameError}
                            />

                            <TextField
                                id="email-field"
                                label="Email"
                                variant='outlined'
                                onChange={handleMailChange}
                                value={newEmail}
                                error={!!emailError}
                                helperText={emailError}
                            />

                            <TextField
                                id="password-field"
                                label="Password"
                                variant='outlined'
                                type='password'
                                value={newPassword}
                                onChange={handlePasswordChange}
                                error={!!passwordError}
                                helperText={passwordError}
                            />
                        </FormControl>
                        <div className='signInSignUp'>
                            <button
                                style={{ justifyContent: "center" }}
                                className='signInButton'> Create account </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default SignUp;
