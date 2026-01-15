// components/analytics/AccountComparison.jsx
import React from 'react';
import { Card } from 'antd';
import { Column } from '@ant-design/charts';

const AccountComparison = ({ data }) => {
  const chartData = data.flatMap(d => [
    {
      account_name: d.account_name,
      metric: 'Impressions',
      value: Number(d.impressions),
    },
    {
      account_name: d.account_name,
      metric: 'Engagements',
      value:
        Number(d.likes) +
        Number(d.comments) +
        Number(d.shares),
    },
  ]);

  const config = {
    data: chartData,
    xField: 'account_name',
    yField: 'value',
    seriesField: 'metric',
    isGroup: true,
    height: 320,
    legend: { position: 'top' },
  };

  return (
    <Card title="Account Performance">
      <Column {...config} />
    </Card>
  );
};


export default AccountComparison;
