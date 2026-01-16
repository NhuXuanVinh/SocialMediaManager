import axios from 'axios';
const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_API_URL + "/api",
  withCredentials: true, // ✅ SEND COOKIES
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: global error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
