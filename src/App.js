//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is the main App component, which contains the header, footer, navigation bar, and content components
//Last modified: 11/03/2024
import './App.css';
import Header from './Header';
import Content from './Content';
import Footer from './Footer';
import NavBar from './NavBar';
import { Routes, Route } from 'react-router-dom';
import Product from './Product';
import Detail from './Detail';
import ShoppingCart from './ShoppingCart';
import AuthProvider from './AuthProvider';
import PrivateRoute from './PrivateRoute';
import GameCategory from './GameCategory';
import MovieCategory from './MovieCategory';
import BookCategory from './BookCategory';
import SignUp from './signUp.js';
import SearchResult from './SearchResult.js';
import LogIn from './LogIn';
import Unauthorized from './unauthorized.js';
import AdminDashboard from './adminView/adminDashboard.js';
import CustomerManagement from './adminView/customerManagement.js';
import StaffManagement from './adminView/staffManagement.js';
import ItemManagement from './adminView/itemManagement.js';
import { ToastContainer } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className='main'>
      <AuthProvider>
        <ToastContainer transition={Slide} autoClose={2000} />
        <Header />
        <NavBar />
        <div className='mainContent'>
          <Routes>
            <Route path="/login" element={<LogIn />} />
            <Route element={<PrivateRoute allowedRoles={['Customer']} />}>
              <Route path="/shoppingcart" element={<ShoppingCart />} />
              <Route path="/detail/:userID" element={<Detail />} />
              <Route path="/detail" element={<Detail />} />
            </Route>
            <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
              <Route path="/AdminDashboard" element={<AdminDashboard />} />
              <Route path="/CustomerManagement" element={<CustomerManagement />} /> 
              <Route path="/StaffManagement" element={<StaffManagement />} />
              <Route path="/ItemManagement" element={<ItemManagement />} />
            </Route>
            <Route path="/game" element={<GameCategory />} />
            <Route path="/unauthorized" element={<Unauthorized/>} />
            <Route path="/book" element={<BookCategory />} />
            <Route path="/movie" element={<MovieCategory />} />
            <Route path="/" element={<Content />} />
            <Route path="/item/:ID" element={<Product />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/searchresult/:term" element={<SearchResult />} />
          </Routes>
        </div>
        <Footer />
      </AuthProvider>
      </div>
    
  );
}

export default App;
