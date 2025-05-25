//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for managing the authentication slice of the Redux store, including login and logout actions
//Last modified: 11/03/2024
//source: https://medium.com/@mbaah80/getting-started-with-authentication-in-redux-using-createasyncthunk-ae3e9dc5b893
import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

//initial state of the auth slice
const initialState = {
  isLoggedIn: false,
  user: null,
  userID: null,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    //login action
    login: (state, action) => {
      state.isLoggedIn = true;
      console.log("action.payload", action.payload);
      //set the user, userID and role from the payload
      state.user = action.payload.username;
      state.userID = action.payload.userID;
      state.role = action.payload.role;
      
      if (state.user && state.user !== "undefined") {
        toast(`Hi ${state.user}`, {
          position: "top-right",
        });
      } else {
        toast(`Hi new user`, {
          position: "top-right",
        });
      }
    },
    
    //logout action
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.userID = null
      state.role = null;
      toast("You have logged out.", {
        position: "top-right",
      });
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
