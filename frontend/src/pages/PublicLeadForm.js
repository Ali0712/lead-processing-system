"use client"

import { useState } from "react"
import { useMutation } from "react-query"
import { Form, Input, Button, Card, Select, notification, Result, Typography, Layout } from "antd"
import { UserOutlined, MailOutlined, PhoneOutlined, BankOutlined, GlobalOutlined } from "@ant-design/icons"
import { Link } from "react-router-dom"
import { leadsApi } from "../api"
import useResponsive from "../hooks/useResponsive"

const { Option } = Select
const { Title, Text } = Typography
const { Header, Content, Footer } = Layout

const PublicLeadForm = () => {
  const [form] = Form.useForm()
  const [submitted, setSubmitted] = useState(false)
  const { isMobile } = useResponsive()

  const mutation = useMutation(leadsApi.submitLead, {
    onSuccess: () => {
      notification.success({
        message: "Lead Submitted",
        description: "Your lead has been successfully submitted for processing.",
      })
      setSubmitted(true)
    },
    onError: (error) => {
      notification.error({
        message: "Submission Failed",
        description: error.response?.data?.error || "Failed to submit lead. Please try again.",
      })
    },
  })

  const onFinish = (values) => {
    // Add IP address (in a real app, this would be handled by the server)
    const leadData = {
      ...values,
    }

    mutation.mutate(leadData)
  }

  const handleReset = () => {
    form.resetFields()
    setSubmitted(false)
  }

  const renderContent = () => {
    if (submitted) {
      return (
        <Result
          status="success"
          title="Lead Successfully Submitted!"
          subTitle="Thank you for your submission. Our team will contact you shortly."
          extra={[
            <Button type="primary" key="new" onClick={handleReset}>
              Submit Another Lead
            </Button>,
            <Button key="login">
              <Link to="/login">Admin Login</Link>
            </Button>,
          ]}
        />
      )
    }

    return (
      <Card title="Submit Your Information" bordered={false}>
        <Form
          form={form}
          name="public_lead_form"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ source: "Website" }}
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter your full name" }]}>
            <Input
              prefix={<UserOutlined />}
              placeholder="John Doe"
              size={isMobile ? "middle" : "large"}
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="john.doe@example.com"
              size={isMobile ? "middle" : "large"}
              autoComplete="email"
              inputMode="email"
            />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number">
            <Input
              prefix={<PhoneOutlined />}
              placeholder="+1 (555) 123-4567"
              size={isMobile ? "middle" : "large"}
              autoComplete="tel"
              inputMode="tel"
            />
          </Form.Item>

          <Form.Item name="company" label="Company">
            <Input
              prefix={<BankOutlined />}
              placeholder="Acme Inc."
              size={isMobile ? "middle" : "large"}
              autoComplete="organization"
            />
          </Form.Item>

          <Form.Item name="website" label="Website">
            <Input
              prefix={<GlobalOutlined />}
              placeholder="https://www.example.com"
              size={isMobile ? "middle" : "large"}
              autoComplete="url"
              inputMode="url"
            />
          </Form.Item>

          <Form.Item
            name="source"
            label="How did you hear about us?"
            rules={[{ required: true, message: "Please select an option" }]}
          >
            <Select placeholder="Select a source" size={isMobile ? "middle" : "large"}>
              <Option value="Website">Website</Option>
              <Option value="Referral">Referral</Option>
              <Option value="Social Media">Social Media</Option>
              <Option value="Email">Email Campaign</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Message">
            <Input.TextArea rows={4} placeholder="How can we help you?" size={isMobile ? "middle" : "large"} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isLoading}
              block
              size={isMobile ? "middle" : "large"}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    )
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "0 16px" : "0 50px",
          height: isMobile ? "56px" : "64px",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: isMobile ? "16px" : "18px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: isMobile ? "200px" : "none",
          }}
        >
          Lead Processing System
        </div>
        <Button type="primary" ghost size={isMobile ? "small" : "middle"}>
          <Link to="/login">Admin Login</Link>
        </Button>
      </Header>
      <Content
        style={{
          padding: isMobile ? "30px 16px" : "50px 50px",
          background: "#f0f2f5",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: isMobile ? "20px" : "30px" }}>
            <Title level={isMobile ? 3 : 2}>Contact Us</Title>
            <Text type="secondary">Fill out the form below and our team will get back to you as soon as possible.</Text>
          </div>
          {renderContent()}
        </div>
      </Content>
      <Footer
        style={{
          textAlign: "center",
          padding: isMobile ? "12px" : "24px",
        }}
      >
        Lead Processing System ©{new Date().getFullYear()} Created by Your Company
      </Footer>
    </Layout>
  )
}

export default PublicLeadForm
