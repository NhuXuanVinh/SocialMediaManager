import axios from 'axios';

const API_URL = 'http://localhost:5000/api/account';  // Change this to your backend URL if different

// Create a new group
export const getAccountsByUser = (userId) => {
  return axios.get(`${API_URL}/get-accounts/${userId}`);
};