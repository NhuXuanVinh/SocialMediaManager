import React, { useState, useEffect } from 'react';
import {
  Layout,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
} from 'antd';
import { PlusOutlined, CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';

// 🔹 Tag APIs
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from '../apis/tagAPI';

const { Content } = Layout;

const colorOptions = [
  'red',
  'orange',
  'gold',
  'green',
  'cyan',
  'blue',
  'purple',
];

const TagManagement = () => {
  const workspaceId = localStorage.getItem('workspaceId');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  // 🔹 Load tags from API
  const fetchTags = async (search = '') => {
    try {
      setLoading(true);
      const res = await getTags({workspaceId, search });
      setTags(res.data.data);
    } catch (err) {
      message.error(err.message || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    
  }, []);

  // 🔍 Backend search (debounce optional later)
  useEffect(() => {
    fetchTags(searchTerm);
  }, [searchTerm]);

  const handleAddClick = () => {
    setEditingTag(null);
    form.resetFields();
    setSelectedColor(colorOptions[0]);
    setIsModalVisible(true);
  };

  const handleEditClick = (tag) => {
    setEditingTag(tag);
    form.setFieldsValue({
      name: tag.name,
      description: tag.description,
    });
    setSelectedColor(tag.color || colorOptions[0]);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTag(id, workspaceId);
      message.success('Tag deleted');
      fetchTags(searchTerm);
    } catch (err) {
      message.error(err.message || 'Failed to delete tag');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingTag(null);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        color: selectedColor,
      };

      if (editingTag) {
        await updateTag(editingTag.tag_id, {workspaceId, ...payload});
        message.success('Tag updated');
      } else {
        await createTag({workspaceId, ...payload});
        message.success('Tag created');
      }

      handleModalCancel();
      fetchTags(searchTerm);
    } catch (err) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  const columns = [
    {
      title: 'Tag',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Tag color={record.color} style={{ fontSize: 13, padding: '4px 8px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Usage',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 120,
      render: (count) => <span>{count ?? 0} posts</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => handleEditClick(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this tag?"
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
            onConfirm={() => handleDelete(record.tag_id)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Topbar />

      <Layout>

        <Content style={{ margin: 24, padding: 24, background: '#fff' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <div>
              <h2 style={{ marginBottom: 4 }}>Tag Management</h2>
              <p style={{ margin: 0, color: '#888' }}>
                Create and organize tags for your posts
              </p>
            </div>

            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddClick}>
              New Tag
            </Button>
          </div>

          {/* Search */}
          <div style={{ marginBottom: 16, maxWidth: 320 }}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <Table
            loading={loading}
            dataSource={tags}
            columns={columns}
            rowKey="tag_id"
            pagination={{ pageSize: 7 }}
          />
        </Content>
      </Layout>

      {/* Modal */}
      <Modal
        title={editingTag ? 'Edit Tag' : 'Create Tag'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        okText={editingTag ? 'Save' : 'Create'}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tag Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a tag name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Tag Color" required>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {colorOptions.map((color) => (
                <div
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: color,
                    cursor: 'pointer',
                    border:
                      selectedColor === color
                        ? '3px solid #000'
                        : '2px solid #fff',
                  }}
                >
                  {selectedColor === color && (
                    <CheckOutlined style={{ color: '#fff', fontSize: 12 }} />
                  )}
                </div>
              ))}
            </div>
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default TagManagement;
