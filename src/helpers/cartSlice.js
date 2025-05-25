//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for managing the cart slice of the Redux store, including adding, removing, and updating items in the cart
//Last modified: 11/03/2024
import { createSlice } from "@reduxjs/toolkit";
import {toast} from "react-toastify";

const initialState = { 
    cartItem: [], 
    cartQty: 0,
    cartAmount: 0,
}; 

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        //source for add to cart
        //https://youtu.be/uRoJJKJMbXQ?si=vZiGBzxUwXLuNDoz
        addToCart(state, action) {
            const itemIndex = state.cartItem.findIndex(
                (item) => item.ItemId === action.payload.ItemId
            );
            console.log("a", action.payload); ;
            if (itemIndex >= 0) {
                // const tempItem = { ...action.payload, quantity: 1 };
                // state.cartItem.push(tempItem);
                state.cartItem[itemIndex].quantity += 1;
                toast.success(`${state.cartItem[itemIndex].Product.Name} quantity increased (${state.cartItem[itemIndex].quantity})`, {
                    position: "top-right",
                });
                
            } else {
                const tempItem = { ...action.payload, quantity: 1 };
                state.cartItem.push(tempItem);
                toast.success("Item added to cart", {
                    position: "top-right",
                    autoClose: 1000,
                });
            }
            console.log("cartItem1", action.payload);
            state.cartQty += 1;
            state.cartAmount += action.payload.Price;
            
        },

    //source for remove item in cart
    //https://youtu.be/zVGc8D4m9MA?si=w8g_yd9mB2eQUYur
        removeItemFromCart(state, action)  {
            const nextCartItems = state.cartItem.filter(
                (cartItem)=> cartItem.ItemId !== action.payload.ItemId
            );

            state.cartItem = nextCartItems;
            console.log("nextCartItems", nextCartItems);

            localStorage.setItem("cartItem", JSON.stringify(nextCartItems));

            toast.error(`${action.payload.Product.Name} removed from cart`, {
                position: "top-right",
            });
    },
    //source for total amount
    //https://www.youtube.com/watch?v=A3LzKfR7AFc&list=PL63c_Ws9ecIRnNHCSqmIzfsMAYZrN71L6&index=19
          totalAmount(state) {
            let { total, quantity } = state.cartItem.reduce(
                (cartTotal, cartItem) => {
                    const { Price, quantity } = cartItem;
                    const itemTotal = Price * quantity;

                    cartTotal.total += itemTotal;
                    cartTotal.quantity += quantity;

                    return cartTotal;
                },
                {
                    total: 0,
                    quantity: 0,
                }
            );

            state.cartAmount = total;
            state.cartQty = quantity;
        },

        //source for decrease item
        //https://www.youtube.com/watch?v=zC4zRlQVDAw&list=PL63c_Ws9ecIRnNHCSqmIzfsMAYZrN71L6&index=17
        decreaseItem(state, action) {
            const itemIndex = state.cartItem.findIndex(
                (item) => item.ItemId === action.payload.ItemId
            );

            if (state.cartItem[itemIndex].quantity > 1) {
                state.cartItem[itemIndex].quantity -= 1;
                state.cartQty -= 1;
                state.cartAmount -= action.payload.Price;

                toast.info(`${state.cartItem[itemIndex].Product.Name} quantity decreased by 1`, {
                    position: "top-right",
                });
            } else {
                const nextCartItems = state.cartItem.filter(
                    (cartItem)=> cartItem.ItemId !== action.payload.ItemId
                );
    
                state.cartItem = nextCartItems;
                console.log("nextCartItems", nextCartItems);
    
                localStorage.setItem("cartItem", JSON.stringify(nextCartItems));
    
                toast.error(`${action.payload.Product.Name} removed from cart`, {
                    position: "top-right",
                });
            }
        },

        increaseItem(state, action) {
            const itemIndex = state.cartItem.findIndex(
                (item) => item.ItemId === action.payload.ItemId
            );
                state.cartItem[itemIndex].quantity += 1;
                state.cartQty += 1;
                state.cartAmount += action.payload.Price;

                toast.info(`${state.cartItem[itemIndex].Product.Name} quantity increased by 1`, {
                    position: "top-right",
                });
        },

        clearCart(state, action) {
            state.cartItem = [];
            state.cartQty = 0;
            state.cartAmount = 0;
        }

    }});

export const { addToCart,  removeItemFromCart, totalAmount, decreaseItem, increaseItem, clearCart} = cartSlice.actions;
export default cartSlice.reducer;
