//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for managing the private route of the application
//Last modified: 11/03/2024
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ allowedRoles }) => {
  const { isLoggedIn, role } = useSelector((state) => state.auth);

  // If the user is not logged in, redirect to the login page
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // If the user is logged in but does not have the required role, redirect to the unauthorized page
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />;
  }

  // If the user is logged in and has the required role, display the component
  return <Outlet />;
};

export default PrivateRoute;
