"use client"

import { useState } from "react"
import { Form, Input, Button, Card, Alert, Typography } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import useResponsive from "../hooks/useResponsive"

const { Title, Text } = Typography

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { isMobile } = useResponsive()

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/"

  const onFinish = async (values) => {
    try {
      setLoading(true)
      setError("")
      await login(values.email, values.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <Card className="auth-card" style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={isMobile ? 3 : 2}>Lead Processing System</Title>
          <Text type="secondary">Sign in to access the admin dashboard</Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

        <Form name="login_form" initialValues={{ remember: true }} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email address!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size={isMobile ? "middle" : "large"}
              autoComplete="email"
              inputMode="email"
            />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size={isMobile ? "middle" : "large"}
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size={isMobile ? "middle" : "large"}>
              Sign In
            </Button>
          </Form.Item>

          {/* <div style={{ textAlign: "center" }}>
            <Text>Don't have an account? </Text>
            <Link to="/signup">Sign up</Link>
          </div> */}

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Link to="/public/submit">Submit a lead without logging in</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login
