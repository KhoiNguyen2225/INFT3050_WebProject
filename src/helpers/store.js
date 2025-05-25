//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for managing the Redux store, including the auth and cart slices
//Last modified: 11/03/2024
//source: https://medium.com/@mbaah80/getting-started-with-authentication-in-redux-using-createasyncthunk-ae3e9dc5b893
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});

export default store;
