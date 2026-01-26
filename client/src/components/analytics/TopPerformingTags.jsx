// components/analytics/TopPerformingTags.jsx
import React from 'react';
import { Card, Table, Tag } from 'antd';

const TopPerformingTags = ({ data = [] }) => {
  const columns = [
    {
      title: 'Tag',
      dataIndex: 'tag_name',
      render: name => <Tag color="blue">#{name}</Tag>,
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      sorter: (a, b) => b.impressions - a.impressions,
    },
    {
      title: 'Engagement',
      render: (_, r) =>
        r.likes + r.comments + r.shares,
    },
    {
      title: 'Engagement Rate',
      dataIndex: 'engagementRate',
      sorter: (a, b) => b.engagementRate - a.engagementRate,
      render: v => `${v.toFixed(2)}%`,
    },
  ];

  return (
    <Card title="Top Performing Tags">
      <Table
        rowKey="tag_id"
        dataSource={data}
        columns={columns}
        pagination={false}
        locale={{ emptyText: 'No tagged posts yet' }}
      />
    </Card>
  );
};

export default TopPerformingTags;
