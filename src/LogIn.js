//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for the login page of the application
//Last modified: 11/03/2024
import * as React from 'react';
import {  TextField, FormControl } from "@mui/material";
import './LogIn.css';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import HandleLogin from './helpers/HandleLogin';
import { NavLink, useNavigate } from 'react-router-dom';
import { login } from './helpers/authSlice';
import { useDispatch } from 'react-redux';

const LogIn = () => {
    const[username, setUsername] = useState("");
    const[password, setPassword] = useState("");
    const[result, setResult] = useState("");
    const[invalid, setInvalid] = useState(false);
    const auth = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    async function handleSubmitEvent(event) {
        //Prevent reloading of page
        event.preventDefault();
        //Check if the username and password are correct
        const { role, userID } = await HandleLogin(username, password);
        console.log("ID: ", userID);

        //If the username and password are correct, set the result to "Authentication success!" and log the user in
        if(userID) {
            setResult("Authentication success!");
            dispatch(login({username, userID, role}));
            auth.loginAction(username, userID);
            if(role === "Admin") {
                navigate("/AdminDashboard");
            }
            else {
                navigate( `/`);
            }
        }
        else {
            setInvalid(true);
            setResult("Invalid username or password");
        }

    }

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    }
    
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    }

    return(
        <form onSubmit={handleSubmitEvent}>
        <div className='LogInContainer'>
            <div className='LogInForm'>
                <h1> Sign In </h1>
                <div style={{width: 400 + "px"}}>  
                    <TextField id="username" 
                    fullWidth label="Username"
                    type="username"
                    name="username"
                    onChange={handleUsernameChange}/>
                </div>
                    <FormControl sx={{ m: 1, width: 400 + 'px' }}  variant="outlined">
                        <TextField 
                        id="password-field"
                        label="Password"
                        variant='outlined'
                        type='password'
                        value={password}
                        onChange={handlePasswordChange}/>
                </FormControl>
            </div>

            <div className='signInSignUp'>
                <button 
                style={{ justifyContent:"center"}} 
                className='signInButton'> Sign in </button> 
                {/* alert when wrong username or password */}
                {invalid? <p style={{color: "red"}}> {result} </p> : null}
                <p>Don't have an account? <NavLink to ="/signup"> Sign Up</NavLink> </p>  
            </div>
        </div>
        </form>
    );
}

export default LogIn;
