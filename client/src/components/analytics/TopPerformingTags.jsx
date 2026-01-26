import React from 'react';
import { Card, Table } from 'antd';

const TopPerformingTags = ({ data = [] }) => {
  const columns = [
    {
      title: 'Tag',
      dataIndex: 'tag_name',
      key: 'tag_name',
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      render: (v) => Number(v || 0),
      sorter: (a, b) =>
        Number(b.impressions || 0) - Number(a.impressions || 0),
    },
    {
      title: 'Engagements',
      render: (_, r) =>
        Number(r.likes || 0) +
        Number(r.comments || 0) +
        Number(r.shares || 0),
    },
    {
      title: 'Engagement Rate',
      key: 'engagement_rate',
      render: (_, r) => {
        const impressions = Number(r.impressions || 0);
        const engagements =
          Number(r.likes || 0) +
          Number(r.comments || 0) +
          Number(r.shares || 0);

        if (!impressions) return '0%';

        const rate = (engagements / impressions) * 100;
        return `${rate.toFixed(2)}%`;
      },
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
    },
  ];

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
