// src/utils/RootRedirect.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosClient from "../apis/axiosClient";
import { Spin } from "antd";

const RootRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosClient.get("/auth/me");
        setIsAuthed(!!res?.data?.success);
      } catch {
        setIsAuthed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return isAuthed
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/login" replace />;
};

export default RootRedirect;
