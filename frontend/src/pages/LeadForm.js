"use client"

import { useState } from "react"
import { useMutation } from "react-query"
import { Form, Input, Button, Card, Select, notification, Result } from "antd"
import { UserOutlined, MailOutlined, PhoneOutlined, BankOutlined, GlobalOutlined } from "@ant-design/icons"
import { leadsApi } from "../api"
import useResponsive from "../hooks/useResponsive"

const { Option } = Select

const LeadForm = () => {
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
      ...values
    }

    mutation.mutate(leadData)
  }

  const handleReset = () => {
    form.resetFields()
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <Result
        status="success"
        title="Lead Successfully Submitted!"
        subTitle="Your lead has been queued for processing and will be available in the leads list shortly."
        extra={[
          <Button type="primary" key="new" onClick={handleReset}>
            Submit Another Lead
          </Button>,
        ]}
      />
    )
  }

  return (
    <div className="lead-form-container">
      <Card title="Submit New Lead" bordered={false}>
        <Form form={form} name="lead_form" layout="vertical" onFinish={onFinish} initialValues={{ source: "Website" }}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter the full name" }]}>
            <Input prefix={<UserOutlined />} placeholder="John Doe" size={isMobile ? "middle" : "large"} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter an email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="john.doe@example.com" size={isMobile ? "middle" : "large"} />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number" rules={[{ required: false }]}>
            <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" size={isMobile ? "middle" : "large"} />
          </Form.Item>

          <Form.Item name="company" label="Company" rules={[{ required: false }]}>
            <Input prefix={<BankOutlined />} placeholder="Acme Inc." size={isMobile ? "middle" : "large"} />
          </Form.Item>

          <Form.Item name="website" label="Website" rules={[{ required: false }]}>
            <Input
              prefix={<GlobalOutlined />}
              placeholder="https://www.example.com"
              size={isMobile ? "middle" : "large"}
            />
          </Form.Item>

          <Form.Item
            name="source"
            label="Lead Source"
            rules={[{ required: true, message: "Please select a lead source" }]}
          >
            <Select placeholder="Select a source" size={isMobile ? "middle" : "large"}>
              <Option value="Website">Website</Option>
              <Option value="Referral">Referral</Option>
              <Option value="Social Media">Social Media</Option>
              <Option value="Email">Email Campaign</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Additional Notes">
            <Input.TextArea
              rows={4}
              placeholder="Any additional information about this lead..."
              size={isMobile ? "middle" : "large"}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isLoading}
              block
              size={isMobile ? "middle" : "large"}
            >
              Submit Lead
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LeadForm
