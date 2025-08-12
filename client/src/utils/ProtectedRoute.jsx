import React from 'react';
import {Outlet,  Navigate } from 'react-router-dom';

// PrivateRoute component to protect routes
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');  // Check if JWT token exists in localStorage
  console.log('Token:', token);
	// const navigate = useNavigate()
  return token ? <Outlet/> : <Navigate to='/login'/>
};

export default ProtectedRoute;
