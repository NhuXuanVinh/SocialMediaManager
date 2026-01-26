import React from 'react';
import { Card, Table, Tag as AntTag } from 'antd';

const TopPerformingTags = ({ data = [] }) => {
  const columns = [
    {
      title: 'Tag',
      dataIndex: 'tag_name',
      key: 'tag_name',
      render: (name) => name || '-',
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      key: 'impressions',
      render: (v) => Number(v || 0),
    },
    {
      title: 'Likes',
      dataIndex: 'likes',
      key: 'likes',
      render: (v) => Number(v || 0),
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      key: 'comments',
      render: (v) => Number(v || 0),
    },
    {
      title: 'Shares',
      dataIndex: 'shares',
      key: 'shares',
      render: (v) => Number(v || 0),
    },
    {
      title: 'Engagement Rate',
      key: 'engagement_rate',
      render: (_, record) => {
        const impressions = Number(record.impressions || 0);
        const engagement =
          Number(record.likes || 0) +
          Number(record.comments || 0) +
          Number(record.shares || 0);

        if (!impressions) return '0%';

        const rate = (engagement / impressions) * 100;
        return `${rate.toFixed(2)}%`;
      },
    },
  ];

  if (!data.length) {
    return (
      <Card title="Top Performing Tags">
        <p style={{ color: '#999' }}>No tag analytics available.</p>
      </Card>
    );
  }

  return (
    <Card title="Top Performing Tags">
      <Table
        rowKey="tag_id"
        dataSource={data}
        columns={columns}
        pagination={false}
      />
    </Card>
  );
};

export default TopPerformingTags;
