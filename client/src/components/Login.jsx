import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Alert, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axiosClient from "../apis/axiosClient";
import { useNavigate, Link } from "react-router-dom";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosClient.post("/auth/login", {
        username: values.username,
        password: values.password,
      });

      // ✅ Store userId safely (non-sensitive)
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("workspaceId", res.data.workspace?.id);
      localStorage.setItem("ownerWorkspaceId", res.data.workspace?.id);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
        background:
          "radial-gradient(circle at 20% 10%, rgba(24,144,255,0.18), transparent 45%)," +
          "radial-gradient(circle at 90% 30%, rgba(114,46,209,0.14), transparent 45%)," +
          "linear-gradient(180deg, #0b1220 0%, #0f172a 100%)",
      }}
    >
      <Card
        bordered={false}
        style={{
          width: 420,
          borderRadius: 18,
          boxShadow: "0 20px 70px rgba(0,0,0,0.35)",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
        }}
        bodyStyle={{ padding: 28 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 18 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Welcome back 👋
          </Title>
          <Text type="secondary">
            Login to manage your workspaces and social channels.
          </Text>
        </div>

        {/* Error */}
        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Form */}
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Enter username"
              autoComplete="username"
              style={{ borderRadius: 12 }}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Enter password"
              autoComplete="current-password"
              style={{ borderRadius: 12 }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            block
            style={{
              borderRadius: 12,
              height: 44,
              fontWeight: 600,
              boxShadow: "0 10px 24px rgba(24,144,255,0.25)",
            }}
          >
            Login
          </Button>
        </Form>

        <Divider style={{ margin: "18px 0" }} />

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text type="secondary">
            Don’t have an account?{" "}
            <Link to="/signup" style={{ fontWeight: 600 }}>
              Sign Up
            </Link>
          </Text>

          <Text type="secondary">
            <Link to="/forgot-password" style={{ fontWeight: 600 }}>
              Forgot?
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
