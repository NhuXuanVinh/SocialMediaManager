import React, { useState } from 'react';
import { Card, Button, Row, Col, message } from 'antd';
import axios from 'axios';

const ConnectAccounts = () => {
  const [loading, setLoading] = useState({ twitter: false, linkedin: false, facebook: false });

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const startFlow = async (platform) => {
    try {
      setLoading((prev) => ({ ...prev, [platform]: true }));
      let url = '';
      if (platform === 'twitter') url = 'http://localhost:5000/api/auth/twitter';
      if (platform === 'linkedin') url = 'http://localhost:5000/api/auth/linkedin';
      if (platform === 'facebook') url = 'http://localhost:5000/api/auth/facebook';

      const { data } = await axios.post(
        url,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error(err);
      message.error(`Failed to start ${platform} auth`);
    } finally {
      setLoading((prev) => ({ ...prev, [platform]: false }));
    }
  };

  return (
    <Row gutter={[16, 16]} style={{ padding: 24 }}>
      <Col xs={24} md={8}>
        <Card title="Twitter" bordered>
          <p>Connect your Twitter account to post and manage content.</p>
          <Button type="primary" onClick={() => startFlow('twitter')} loading={loading.twitter}>
            Connect Twitter
          </Button>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title="LinkedIn" bordered>
          <p>Connect your LinkedIn account to share updates.</p>
          <Button type="primary" onClick={() => startFlow('linkedin')} loading={loading.linkedin}>
            Connect LinkedIn
          </Button>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title="Facebook" bordered>
          <p>Connect your Facebook Page to publish posts.</p>
          <Button type="primary" onClick={() => startFlow('facebook')} loading={loading.facebook}>
            Connect Facebook
          </Button>
        </Card>
      </Col>
    </Row>
  );
};

export default ConnectAccounts;