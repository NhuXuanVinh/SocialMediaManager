// components/analytics/AnalyticsKPI.jsx
import React from 'react';
import { Row, Col, Statistic, Card } from 'antd';

const AnalyticsKPI = ({ data }) => {
  if (!data) return null;

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic title="Impressions" value={data.impressions} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Likes" value={data.likes} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Comments" value={data.comments} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Shares" value={data.shares} />
        </Card>
      </Col>
    </Row>
  );
};

export default AnalyticsKPI;
