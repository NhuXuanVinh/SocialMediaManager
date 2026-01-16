// components/analytics/PlatformComparison.jsx
import React from 'react';
import { Card } from 'antd';
import { Column } from '@ant-design/charts';

const PlatformComparison = ({ data }) => {
  const config = {
    data,
    xField: 'platform',
    yField: 'impressions',
    height: 300,
  };

  return (
    <Card title="Platform Comparison" style={{ marginBottom: 24 }}>
      <Column {...config} />
    </Card>
  );
};

export default PlatformComparison;
