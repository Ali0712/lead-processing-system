"use client"

import { useState } from "react"
import { Form, Input, Button, Card, Alert, Typography } from "antd"
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import useResponsive from "../hooks/useResponsive"

const { Title, Text } = Typography

const Signup = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()
  const { isMobile } = useResponsive()

  const onFinish = async (values) => {
    try {
      setLoading(true)
      setError("")
      await signup(values.name, values.email, values.password)
      setSuccess(true)
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <Card className="auth-card" style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={isMobile ? 3 : 2}>Create an Account</Title>
          <Text type="secondary">Sign up to access the lead management system</Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
        {success && (
          <Alert
            message="Account created successfully!"
            description="Redirecting to login page..."
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form name="signup_form" onFinish={onFinish} layout="vertical">
          <Form.Item name="name" rules={[{ required: true, message: "Please input your name!" }]}>
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
              size={isMobile ? "middle" : "large"}
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email address!" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size={isMobile ? "middle" : "large"}
              autoComplete="email"
              inputMode="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size={isMobile ? "middle" : "large"}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error("The two passwords do not match!"))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size={isMobile ? "middle" : "large"}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size={isMobile ? "middle" : "large"}>
              Sign Up
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text>Already have an account? </Text>
            <Link to="/login">Sign in</Link>
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Link to="/public/submit">Submit a lead without an account</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Signup
