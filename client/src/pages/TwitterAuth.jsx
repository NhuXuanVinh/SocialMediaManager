import React, { useState } from 'react';
import axios from 'axios';

const TwitterAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [accessTokenSecret, setAccessTokenSecret] = useState('');

  // Fetch logged-in user's ID from localStorage or state
  const userId = localStorage.getItem('userId'); // This assumes the userId is saved in localStorage after login
  console.log(userId)
  const handleAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Send the userId along with the request to start the OAuth flow
      const response = await axios.post(
        'http://localhost:5000/api/auth/twitter',
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );
      window.location.href = response.data.redirectUrl;
      setLoading(false);
    } catch (err) {
      setError('Error during authentication');
    }
  };

  return (
    <div>
      <h1>Twitter OAuth Authentication</h1>

      {/* Button to initiate OAuth flow */}
      <button onClick={handleAuth} disabled={loading}>
        {loading ? 'Redirecting to Twitter...' : 'Authenticate with Twitter'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {accessToken && (
        <div>
          <h3>Access Token:</h3>
          <p>{accessToken}</p>
          <h3>Access Token Secret:</h3>
          <p>{accessTokenSecret}</p>
        </div>
      )}
    </div>
  );
};

export default TwitterAuth;
