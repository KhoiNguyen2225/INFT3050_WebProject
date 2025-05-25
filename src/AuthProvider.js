//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for managing the authentication context of the application
//Last modified: 11/03/2024
import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "./helpers/authSlice";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {

    //Testing from authSlice.js
    const dispatch = useDispatch();

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("site") || "");
    const navigate = useNavigate();

    var tok = 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ';

    const loginAction = async (username, userID) => {
        //setLoggedIn to true because the user is logged in
        setUser(username);
        setToken(tok);
        localStorage.setItem("site", tok);
        return userID;
    };

    const logOut = () => {
        //setLoggedIn to false because the user is logged out
        setUser(null);
        setToken("");
        dispatch(logout());
        localStorage.removeItem("site");
        //navigate to the login page
        navigate("/LogIn");
    };

    return (
        <AuthContext.Provider value={{ token, user, loginAction, logOut}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext);
};
