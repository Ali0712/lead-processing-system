import { useState } from "react"
import { useMutation } from "react-query"
import { Form, Input, Button, Card, Select, notification, Result, Row, Col } from "antd"
import { UserOutlined, MailOutlined, PhoneOutlined, BankOutlined, GlobalOutlined } from "@ant-design/icons"
import { leadsApi } from "../api"

const { Option } = Select

const LeadForm = () => {
  const [form] = Form.useForm()
  const [submitted, setSubmitted] = useState(false)

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
    const leadData = {
      ...values,
      // ip: "192.168.1.1", // Dummy IP for demo/
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
        extra={[<Button type="primary" key="new" onClick={handleReset}>Submit Another Lead</Button>]}
      />
    )
  }

  return (
    <div className="lead-form-container">
      <Card title="Submit New Lead">
        <Form form={form} name="lead_form" layout="vertical" onFinish={onFinish} initialValues={{ source: "Website" }}>
          {/* Row 1: Name and Email */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter the full name" }]}>
                <Input prefix={<UserOutlined />} placeholder="John Doe" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: "Please enter an email" }, { type: "email", message: "Please enter a valid email" }]}
              >
                <Input prefix={<MailOutlined />} placeholder="john.doe@example.com" />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 2: Phone and Company */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone Number" rules={[{ required: false }]}>
                <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="company" label="Company" rules={[{ required: false }]}>
                <Input prefix={<BankOutlined />} placeholder="Acme Inc." />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 3: Website and Source */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="website" label="Website" rules={[{ required: false }]}>
                <Input prefix={<GlobalOutlined />} placeholder="https://www.example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="source" label="Lead Source" rules={[{ required: true, message: "Please select a lead source" }]}>
                <Select placeholder="Select a source">
                  <Option value="Website">Website</Option>
                  <Option value="Referral">Referral</Option>
                  <Option value="Social Media">Social Media</Option>
                  <Option value="Email">Email Campaign</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Row 4: Notes */}
          <Form.Item name="notes" label="Additional Notes">
            <Input.TextArea rows={4} placeholder="Any additional information about this lead..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={mutation.isLoading} block>
              Submit Lead
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LeadForm
