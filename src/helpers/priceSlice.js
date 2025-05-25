//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for managing the price slice of the Redux store, including fetching the price of an item
//Last modified: 11/03/2024
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// source: https://redux-toolkit.js.org/api/createAsyncThunk
const fetchItemPrice = createAsyncThunk(
    "price/fetchItemPrice",
    async (item) => {
        const response = await axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake");
        console.log("thunk", response.data);
        return response.data
    }
)

const initialState = {
    price: []
}

// https://redux-toolkit.js.org/api/createSlice
const priceSlice = createSlice({
    name: "price",
    initialState,
    reducers: {}, 
    extraReducers: (builder) => {
        builder 
        .addCase(fetchItemPrice.fulfilled, (state, action) => {
            state.price = action.payload
            console.log("price", action.payload)
        })
    }
})

export const { itemPrice } = priceSlice.actions;
export { fetchItemPrice };
export default priceSlice.reducer;
