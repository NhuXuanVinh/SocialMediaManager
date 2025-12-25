import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api',
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
