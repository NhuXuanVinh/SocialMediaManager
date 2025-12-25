import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { Layout, Card, Typography, Space, Modal, Badge, Row, Col, Button } from 'antd';
import { getGroupById } from '../apis/groupAPI';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import NewPostModal from '../components/NewPostModal'; // ✅ import

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const GroupDetails = () => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const { groupId } = useParams();

  // Fetch group details
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const { data } = await getGroupById(groupId);
        setGroup(data.group);
      } catch (error) {
        console.error('Error fetching group:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  // Normal post click
  const handlePostClick = (post, account) => {
    if (post.status === 'draft') {
      // ✅ open modal for editing draft
      setEditingDraft({
        ...post,
        accountName: account.account_name,
        platform: account.platform,
      });
    } else {
      // ✅ normal post details modal
      setSelectedPost({
        ...post,
        accountName: account.account_name,
        platform: account.platform,
      });
    }
  };

  const handlePostModalClose = () => setSelectedPost(null);
  const handleDraftModalClose = () => setEditingDraft(null);

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
      <Content style={{ padding: '20px' }}>
        <Title level={3} style={{ marginBottom: '20px' }}>
          {group.group_name}
        </Title>

        <Space direction="vertical" style={{ width: '100%' }}>
          {group.Accounts.map((account) => (
            <Card
              key={account.account_id}
              title={`${account.platform}: ${account.account_name}`}
              extra={
                <a href={account.account_url} target="_blank" rel="noopener noreferrer">
                  View Profile
                </a>
              }
              style={{ width: '100%', borderRadius: 12 }}
            >
              <Row gutter={[16, 16]}>
                {/* ✅ Mock Draft Card */}
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    onClick={() =>
                      handlePostClick(
                        {
                          post_id: 'mock-draft',
                          content:
                            'This is a saved draft post.',
                          status: 'draft',
                          createdAt: new Date().toISOString(),
                        },
                        account
                      )
                    }
                    style={{
                      height: '100%',
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    bodyStyle={{ padding: 16 }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>Content:</Text>
                      <Text
                        ellipsis={{ rows: 3, expandable: false }}
                        style={{ fontSize: 14 }}
                      >
                        This is a draft post
                      </Text>

                      <Badge status="default" text="Draft" />

                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Last saved: {moment().format('MMM D, YYYY, HH:mm')}
                      </Text>
                    </Space>
                  </Card>
                </Col>

                {/* Normal posts */}
                {account.Posts && account.Posts.length > 0 ? (
                  account.Posts.map((post) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={post.post_id}>
                      <Card
                        hoverable
                        onClick={() => handlePostClick(post, account)}
                        style={{
                          height: '100%',
                          borderRadius: 10,
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        bodyStyle={{ padding: 16 }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text strong>Content:</Text>
                          <Text
                            ellipsis={{ rows: 3, expandable: false }}
                            style={{ fontSize: 14 }}
                          >
                            {post.content || 'No content'}
                          </Text>

                          <Badge
                            status={
                              post.status === 'posted'
                                ? 'success'
                                : post.status === 'scheduled'
                                ? 'processing'
                                : 'default'
                            }
                            text={
                              post.status === 'posted'
                                ? 'Posted'
                                : post.status === 'scheduled'
                                ? 'Scheduled'
                                : 'Draft'
                            }
                          />

                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {post.createdAt
                              ? `Posted: ${new Date(post.createdAt).toLocaleString()}`
                              : 'No date'}
                          </Text>

                          {post.post_link && (
                            <a
                              href={post.post_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 13 }}
                            >
                              View Post
                            </a>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col span={24}>
                    <Text type="secondary">No posts found for this account.</Text>
                  </Col>
                )}
              </Row>
            </Card>
          ))}
        </Space>

        {/* Normal Post Details Modal */}
        <Modal
          title="Post Details"
          open={!!selectedPost}
          onCancel={handlePostModalClose}
          footer={[
            selectedPost?.post_link && (
              <Button
                key="view"
                href={selectedPost.post_link}
                target="_blank"
                type="primary"
              >
                View Post
              </Button>
            ),
            <Button key="close" onClick={handlePostModalClose}>
              Close
            </Button>,
          ]}
        >
          {selectedPost && (
            <>
              <Title level={5}>{selectedPost.content || 'No content'}</Title>
              <Paragraph>
                <b>Platform:</b> {selectedPost.platform}
                <br />
                <b>Account:</b> {selectedPost.accountName}
                <br />
                <b>Status:</b> {selectedPost.status}
                <br />
                <b>Time:</b>{' '}
                {selectedPost.createdAt
                  ? moment(selectedPost.createdAt).format('MMM D, YYYY, HH:mm')
                  : 'N/A'}
              </Paragraph>
            </>
          )}
        </Modal>

        {/* ✅ Draft Editing Modal (NewPostModal) */}
        <NewPostModal
          isVisible={!!editingDraft}
          onClose={handleDraftModalClose}
          accounts={group.Accounts}
          initialData={editingDraft} // you can use this to prefill fields inside your modal
        />
      </Content>
    </Layout>
  );
};

export default GroupDetails;
