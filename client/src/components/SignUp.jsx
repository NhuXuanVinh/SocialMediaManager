import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Alert, Divider, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../apis/axiosClient";

const { Title, Text } = Typography;

const SignUp = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const { email, username, password, confirmPassword, phoneNumber } = values;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosClient.post("/auth/register", {
        email,
        username,
        password,
        phone_number: phoneNumber,
      });

      message.success("User registered successfully");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err?.message || "An error occurred. Please try again.");
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
          width: 460,
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
            Create an account ✨
          </Title>
          <Text type="secondary">
            Sign up to start managing your posts across platforms.
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
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="example@email.com"
              autoComplete="email"
              style={{ borderRadius: 12 }}
            />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Choose a username"
              autoComplete="username"
              style={{ borderRadius: 12 }}
            />
          </Form.Item>

          <Form.Item
            label="Phone number"
            name="phoneNumber"
            rules={[
              { required: true, message: "Please enter your phone number" },
              {
                pattern: /^[0-9+()\-\s]{8,20}$/,
                message: "Invalid phone number format",
              },
            ]}
          >
            <Input
              size="large"
              prefix={<PhoneOutlined />}
              placeholder="Phone number"
              autoComplete="tel"
              style={{ borderRadius: 12 }}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Create password"
              autoComplete="new-password"
              style={{ borderRadius: 12 }}
            />
          </Form.Item>

          <Form.Item
            label="Confirm password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Confirm password"
              autoComplete="new-password"
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
            Create account
          </Button>
        </Form>

        <Divider style={{ margin: "18px 0" }} />

        {/* Footer */}
        <Text type="secondary">
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </Text>
      </Card>
    </div>
  );
};

export default SignUp;
