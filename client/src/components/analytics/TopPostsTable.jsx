import React from 'react';
import { Table, Card, Typography } from 'antd';

const { Link, Text } = Typography;

const TopPostsTable = ({ data }) => {
const columns = [
  {
    title: 'Post',
    key: 'content',
    render: (_, record) => {
      const content = record.Post?.content || '';
      return (
        <span>
          {content.slice(0, 80)}
          {content.length > 80 ? '…' : ''}
        </span>
      );
    },
  },
  {
    title: 'Platform',
    render: (_, record) =>
      record.Post?.Account?.platform || '-',
  },
  {
    title: 'Impressions',
    dataIndex: 'impressions',
    defaultSortOrder: 'descend',
    sorter: (a, b) =>
      Number(a.impressions) - Number(b.impressions),
    render: (v) => Number(v),
  },
  {
    title: 'Likes',
    dataIndex: 'likes',
    render: (v) => Number(v),
  },
  {
    title: 'Shares',
    dataIndex: 'shares',
    render: (v) => Number(v),
  },
  {
    title: 'Engagement Rate',
    key: 'engagementRate',
    defaultSortOrder: 'descend',
    sorter: (a, b) => {
      const calc = (r) => {
        const impressions = Number(r.impressions || 0);
        if (!impressions) return 0;
        return (
          (Number(r.likes || 0) +
            Number(r.comments || 0) +
            Number(r.shares || 0)) /
          impressions
        );
      };
      return calc(b) - calc(a);
    },
    render: (_, record) => {
      const impressions = Number(record.impressions || 0);
      if (!impressions) return '0%';

      const rate =
        ((Number(record.likes || 0) +
          Number(record.comments || 0) +
          Number(record.shares || 0)) /
          impressions) *
        100;

      return `${rate.toFixed(2)}%`;
    },
  },
  {
    title: 'Link',
    render: (_, record) =>
      record.Post?.post_link ? (
        <a
          href={record.Post.post_link}
          target="_blank"
          rel="noreferrer"
        >
          View
        </a>
      ) : (
        '-'
      ),
  },
];


  return (
    <Card title="Top Performing Posts">
      <Table
        rowKey="post_id"
        dataSource={data}
        columns={columns}
        pagination={false}
      />
    </Card>
  );
};

export default TopPostsTable;
