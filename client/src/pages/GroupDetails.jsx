import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { Layout, Card, List, Typography, Space,Modal, Spin, Badge } from 'antd';
import { getGroupById } from '../apis/groupAPI'; // Replace with your actual API function
import { useParams } from 'react-router-dom';
import axios from 'axios';
const { Content } = Layout;
const { Title, Text } = Typography;

const GroupDetails = () => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { groupId } = useParams();
  const token = 'EAANEvms1nLMBOZCcyHH92dEbUsDzEBZCihcb4MPeVFYbhgWRKNcaZCkYnrYfwV9mOabb7e3QdB4RcxzqbSI32jZCTWJ36ldQs16e1Wh1BOibnkZA49hwEjZA3ModrgprcDu0H0IdzAKgaHNYQDZBrYGGVu4v9P44HYyAZA62s3yg7Ozg5ZCojtB1qpBaci5ryIPgRnRjZAgo5m3rRXy9nyzvKKlbs3faGkNkJwcVcx6wQuv1VNk5lTIpvF'
  // Fetch group details by ID
  useEffect(() => {
    const fetchGroup = async () => {
      try {
		console.log(groupId)
        const { data } = await getGroupById(groupId); // Replace with your API function
		console.log(data)
        setGroup(data.group); // Assuming API returns { group: { ... } }
      } catch (error) {
        console.error('Error fetching group:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  const fetchPostInsights = async (postId, account) => {
	setModalLoading(true);
	try {
		const url = `https://api.linkedin.com/v2/socialActions/${postId}`;
		const response = await axios.get(url, {
		  headers: {
			Authorization: `Bearer ${token}`,
		  },
		});
	  setInsights(response.data);
	} catch (error) {
	  console.error('Error fetching post insights:', error.response?.data || error.message);
	} finally {
	  setModalLoading(false);
	}
  };
  
  const handlePostClick = (post, account) => {
	setSelectedPost(post);
	setModalVisible(true);
	console.log(post.post_platform_id)
	fetchPostInsights(post.post_platform_id, account);
  };
  const handleModalClose = () => {
    setModalVisible(false);
    setInsights(null);
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <Content style={{ padding: '20px', textAlign: 'center' }}>
        <Title level={4}>Loading group details...</Title>
      </Content>
    );
  }

  if (!group) {
    return (
      <Content style={{ padding: '20px', textAlign: 'center' }}>
        <Title level={4}>Group not found</Title>
      </Content>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
		<Topbar />
      <Content>
        <Title level={3}
		style={{margin:"10px"}}
		>{group.group_name}</Title>

        {/* Accounts Section */}
        <Space direction="vertical" style={{ marginTop: '20px', width: '100%' }}>
          {group.Accounts.map((account) => (
            <Card
              key={account.account_id}
              title={`${account.platform}: ${account.account_name}`}
              extra={
                <a href={account.account_url} target="_blank" rel="noopener noreferrer">
                  View Profile
                </a>
              }
              style={{ width: '100%' }}
            >
              <Title level={5}>Posts</Title>
              <List
                dataSource={account.Posts}
                renderItem={(post) => (
                  <List.Item 
				  	key={post.post_id}
  					onClick={() => handlePostClick(post, account)}
  					style={{ cursor: 'pointer' }}>
					<div>
                   <Text strong>Content: </Text>
				   <Text>{post.content}</Text>
				   </div>
                    <Space direction="vertical" style={{ marginLeft: '10px' }}>
                      
					  <Badge
                      status={post.status === 'posted' ? 'success' : 'processing'}
                      text={post.status === 'posted' ? 'Posted' : 'Scheduled'}
                    />
                      <Text type="secondary">
                        Posted At:{' '}
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleString()
                          : 'N/A'}
                      </Text>
                      <a href={post.post_link} target="_blank" rel="noopener noreferrer">
                        View Post
                      </a>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          ))}
        </Space>
		<Modal
          title={selectedPost ? `Post Insights: ${selectedPost.content}` : 'Post Insights'}
          visible={modalVisible}
          onCancel={handleModalClose}
          footer={null}
        >
          {modalLoading ? (
            <Spin size="large" style={{ display: 'block', textAlign: 'center' }} />
          ) : insights ? (
            <div>
              <p><strong>Post Engaged Users:</strong> {insights.data[0]?.values[0]?.value || 'N/A'}</p>
              <p><strong>Post Impressions:</strong> {insights.data[1]?.values[0]?.value || 'N/A'}</p>
            </div>
          ) : (
            <Text>No insights available</Text>
          )}
        </Modal>
      </Content>
    </Layout>


		  
  );
};

export default GroupDetails;
