// pages/AnalysisPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Layout, Card, Select, Space, Table } from "antd";
import { Button } from "antd";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import { Line } from "@ant-design/charts";
import { getAccountsByUser } from "../apis/accountAPI";
import moment from "moment";
import jsPDF from "jspdf"; // ✅ Only import ONCE at top

const { Content } = Layout;
const { Option } = Select;

/* ------------------------------------------
   STATIC MOCK INSIGHTS (values 0–15)
---------------------------------------------*/

// 14-day series with small values (0–15)
const generateSmallSeries = () => {
  return [...Array(14)].map((_, i) => ({
    date: moment().subtract(13 - i, "days").format("MMM D"),
    value: Math.floor(Math.random() * 16), // 0–15
  }));
};

// Account-level insights
const generateAccountInsights = () => ({
  impressions: generateSmallSeries(),
  engagement: generateSmallSeries(),
  followers: generateSmallSeries(),
});

// Post insights (per post)
const generatePostInsights = (posts) => {
  return posts.map((p, index) => ({
    key: index,
    content: p.content || "(no content)",
    date: moment(p.date).format("MMM D, YYYY"),
    impressions: Math.floor(Math.random() * 16),
    engagement: Math.floor(Math.random() * 16),
    clicks: Math.floor(Math.random() * 6),
    ctr: (Math.random() * 3).toFixed(1) + "%",
  }));
};

/* ------------------------------------------
   EXPORT CSV
---------------------------------------------*/
export const exportInsightsCSV = (accountName, posts = []) => {
  if (!posts || posts.length === 0) {
    alert("No insights available to export.");
    return;
  }

  // Buffer column order
  const headers = [
    "Post ID",
    "Post URL",
    "Created At",
    "Published At",
    "Platform",
    "Profile",
    "Tags",
    "Text",
    "Impressions",
    "Reach",
    "Clicks",
    "Likes",
    "Comments",
    "Shares",
    "Saves",
    "Engagements",
    "Engagement Rate (%)",
    "CTR (%)"
  ];

  let csv = headers.join(",") + "\n";

  posts.forEach((post) => {
    const impressions = post.impressions || 0;
    const clicks = post.clicks || 0;
    const likes = post.likes || post.engagement || 0;
    const comments = post.comments || 0;
    const shares = post.shares || 0;
    const saves = post.saves || 0;

    const engagements = likes + comments + shares + saves;
    const engagementRate =
      impressions > 0 ? ((engagements / impressions) * 100).toFixed(1) : "0.0";
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";

    const row = [
      post.id || "",
      post.postLink || "",
      post.createdAt ? new Date(post.createdAt).toISOString() : "",
      post.date ? new Date(post.date).toISOString() : "",
      post.platform || "",
      accountName || "",
      post.tags ? post.tags.map((t) => t.name).join("; ") : "",
      `"${(post.content || "").replace(/"/g, '""')}"`, // quoted & escaped
      impressions,
      post.reach || impressions,
      clicks,
      likes,
      comments,
      shares,
      saves,
      engagements,
      engagementRate,
      ctr,
    ];

    csv += row.join(",") + "\n";
  });

  // Download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${accountName.replace(/\s+/g, "_")}_buffer_export.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


/* ------------------------------------------
   EXPORT PDF
---------------------------------------------*/
const exportInsightsPDF = (accountName, accountInsights, postInsights) => {
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(18);
  doc.text(`Analytics Report — ${accountName}`, 10, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Summary Metrics (last 14 days)", 10, y);
  y += 8;

  const avg = (series) =>
    Math.round(series.reduce((a, b) => a + b.value, 0) / series.length);

  doc.text(`• Avg Impressions: ${avg(accountInsights.impressions)}`, 10, y);
  y += 6;
  doc.text(`• Avg Engagement: ${avg(accountInsights.engagement)}`, 10, y);
  y += 6;
  doc.text(`• Avg Followers Growth: ${avg(accountInsights.followers)}`, 10, y);
  y += 10;

  doc.setFontSize(14);
  doc.text("Post Insights", 10, y);
  y += 8;

  doc.setFontSize(10);

  postInsights.forEach((p) => {
    if (y > 270) {
      doc.addPage();
      y = 10;
    }

    doc.text(`Post: ${p.content.slice(0, 60)}`, 10, y);
    y += 5;
    doc.text(`Date: ${p.date}`, 10, y);
    y += 5;
    doc.text(
      `Impr: ${p.impressions} | Eng: ${p.engagement} | Clicks: ${p.clicks} | CTR: ${p.ctr}`,
      10,
      y
    );
    y += 8;
  });

  doc.save("analytics_report.pdf");
};

/* ------------------------------------------
   MAIN PAGE COMPONENT
---------------------------------------------*/
const AnalysisPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const [mockInsights, setMockInsights] = useState({});
  const [mockPostInsights, setMockPostInsights] = useState([]);

  // Fetch accounts
  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("userId");
      const { data } = await getAccountsByUser(userId);

      setAccounts(data.accounts || []);

      if (data.accounts.length > 0) {
        const first = data.accounts[0];
        setSelectedAccountId(first.account_id);

        setMockInsights(generateAccountInsights());

        if (first.Posts) {
          setMockPostInsights(generatePostInsights(first.Posts));
        }
      }
    };

    fetchData();
  }, []);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.account_id === selectedAccountId),
    [accounts, selectedAccountId]
  );

  useEffect(() => {
    if (selectedAccount) {
      setMockInsights(generateAccountInsights());

      if (selectedAccount.Posts) {
        setMockPostInsights(generatePostInsights(selectedAccount.Posts));
      } else {
        setMockPostInsights([]);
      }
    }
  }, [selectedAccountId]);

  const chartConfig = (data) => ({
    data,
    xField: "date",
    yField: "value",
    smooth: true,
    autoFit: true,
    height: 220,
    color: "#3b82f6",
    padding: "auto",
  });

  const postColumns = [
    { title: "Post", dataIndex: "content", width: "40%" },
    { title: "Date", dataIndex: "date", width: "15%" },
    { title: "Impressions", dataIndex: "impressions", width: "10%" },
    { title: "Engagement", dataIndex: "engagement", width: "10%" },
    { title: "Clicks", dataIndex: "clicks", width: "10%" },
    { title: "CTR", dataIndex: "ctr", width: "10%" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Topbar />
      <Layout>
        <Sidebar accounts={accounts} />

        <Content style={{ margin: "24px", padding: "24px" }}>
          {/* HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ marginBottom: 4 }}>Analytics Overview</h2>
              <p style={{ opacity: 0.7 }}>Insights for your accounts</p>
            </div>

            <Space>
              <Button
                onClick={() =>
                  exportInsightsCSV(selectedAccount?.account_name,
      mockPostInsights)
                }
              >
                Export CSV
              </Button>

              {/* <Button
                type="primary"
                onClick={() =>
                  exportInsightsPDF(
                    selectedAccount?.account_name,
                    mockInsights,
                    mockPostInsights
                  )
                }
              >
                Export PDF
              </Button> */}

              <Select
                value={selectedAccountId}
                onChange={setSelectedAccountId}
                style={{ width: 220 }}
              >
                {accounts.map((acc) => (
                  <Option value={acc.account_id} key={acc.account_id}>
                    {acc.account_name} ({acc.platform})
                  </Option>
                ))}
              </Select>
            </Space>
          </div>

          {/* KPI Cards */}
          <Space style={{ marginTop: 24 }} size="large" wrap>
            <Card style={{ width: 240 }}>
              <h3>Impressions</h3>
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {mockInsights.impressions?.[13]?.value}
              </div>
            </Card>

            <Card style={{ width: 240 }}>
              <h3>Engagement</h3>
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {mockInsights.engagement?.[13]?.value}
              </div>
            </Card>

            <Card style={{ width: 240 }}>
              <h3>Followers</h3>
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {mockInsights.followers?.[13]?.value}
              </div>
            </Card>
          </Space>

          {/* CHARTS */}
          <Card title="Impressions Over Time" style={{ marginTop: 24 }}>
            <Line {...chartConfig(mockInsights.impressions || [])} />
          </Card>

          <Card title="Engagement Over Time" style={{ marginTop: 24 }}>
            <Line {...chartConfig(mockInsights.engagement || [])} />
          </Card>

          <Card title="Followers Over Time" style={{ marginTop: 24 }}>
            <Line {...chartConfig(mockInsights.followers || [])} />
          </Card>

          {/* POSTS TABLE */}
          <Card title="Post Insights" style={{ marginTop: 24 }}>
            <Table
              dataSource={mockPostInsights}
              columns={postColumns}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AnalysisPage;
