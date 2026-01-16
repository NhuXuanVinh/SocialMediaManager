import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import axiosClient from "../apis/axiosClient"; // make sure this has withCredentials: true
import { Spin } from "antd";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ✅ cookie will be automatically sent
        const res = await axiosClient.get("/auth/me");

        if (res?.data?.success) {
          setIsAuthed(true);
        } else {
          setIsAuthed(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ✅ while checking auth
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // ✅ allow route if logged in
  return isAuthed ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
