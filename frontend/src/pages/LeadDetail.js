"use client"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import { Card, Descriptions, Tag, Button, Spin, Alert, Divider, Row, Col, Timeline } from "antd"
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons"
import dayjs from "dayjs"
import { leadsApi } from "../api"
import useResponsive from "../hooks/useResponsive"

const LeadDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isMobile } = useResponsive()

  const { data: lead, isLoading, error } = useQuery(["lead", id], () => leadsApi.getLead(id))

  // Mock data for development until API is ready
  const mockLead = {
    _id: id,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Inc",
    website: "https://www.acme.com",
    source: "Website",
    score: 85,
    notes: "Interested in enterprise solution",
    createdAt: "2023-09-01T10:30:00Z",
    cleanedAt: "2023-09-01T10:30:05Z",
    enrichedAt: "2023-09-01T10:30:10Z",
    geolocation: {
      country: "United States",
      region: "California",
      city: "San Francisco",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    company: {
      name: "Acme Inc",
      industry: "Technology",
      size: "51-200 employees",
      founded: 2010,
      website: "https://www.acme.com",
    },
  }

  const leadData = lead || mockLead

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p>Loading lead details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert message="Error" description="Failed to load lead details. Please try again later." type="error" showIcon />
    )
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "green"
    if (score >= 60) return "blue"
    if (score >= 40) return "orange"
    return "red"
  }

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/leads")}
        style={{ marginBottom: 16, padding: 0 }}
      >
        Back to Leads
      </Button>

      <h1 style={{ fontSize: isMobile ? "20px" : "24px" }}>Lead Details</h1>

      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
        <Col xs={24} lg={16}>
          <Card title="Basic Information">
            <Descriptions
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              size={isMobile ? "small" : "default"}
              labelStyle={isMobile ? { padding: "8px" } : {}}
              contentStyle={isMobile ? { padding: "8px" } : {}}
            >
              <Descriptions.Item label="Name">
                <UserOutlined style={{ marginRight: 8 }} />
                {leadData.name}
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                <MailOutlined style={{ marginRight: 8 }} />
                {leadData.email}
              </Descriptions.Item>

              <Descriptions.Item label="Phone">
                <PhoneOutlined style={{ marginRight: 8 }} />
                {leadData.phone || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Source">{leadData.source}</Descriptions.Item>

              <Descriptions.Item label="Lead Score">
                <Tag color={getScoreColor(leadData.score)}>{leadData.score}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Created At">
                {dayjs(leadData.createdAt).format("YYYY-MM-DD HH:mm:ss")}
              </Descriptions.Item>
            </Descriptions>

            {leadData.notes && (
              <>
                <Divider
                  orientation="left"
                  style={{ fontSize: isMobile ? "14px" : "16px", margin: isMobile ? "16px 0" : "24px 0" }}
                >
                  Notes
                </Divider>
                <p>{leadData.notes}</p>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Processing Timeline" style={{ marginBottom: 16 }}>
            <Timeline
              items={[
                {
                  color: "green",
                  children: (
                    <>
                      <p>
                        <strong>Lead Created</strong>
                      </p>
                      <p>{dayjs(leadData.createdAt).format("YYYY-MM-DD HH:mm:ss")}</p>
                    </>
                  ),
                },
                {
                  color: "blue",
                  children: (
                    <>
                      <p>
                        <strong>Lead Validated & Cleaned</strong>
                      </p>
                      <p>{dayjs(leadData.cleanedAt).format("YYYY-MM-DD HH:mm:ss")}</p>
                    </>
                  ),
                },
                {
                  color: "blue",
                  children: (
                    <>
                      <p>
                        <strong>Lead Enriched</strong>
                      </p>
                      <p>{dayjs(leadData.enrichedAt).format("YYYY-MM-DD HH:mm:ss")}</p>
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* New row for company and geolocation side by side */}
      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]} style={{ marginTop: isMobile ? 8 : 16 }}>
        {leadData.company && (
          <Col xs={24} lg={12}>
            <Card title="Company Information">
              <Descriptions column={1} size={isMobile ? "small" : "default"}>
                <Descriptions.Item label="Name">{leadData.company.name}</Descriptions.Item>
                <Descriptions.Item label="Industry">{leadData.company.industry}</Descriptions.Item>
                <Descriptions.Item label="Size">{leadData.company.size}</Descriptions.Item>
                <Descriptions.Item label="Founded">{leadData.company.founded}</Descriptions.Item>
                <Descriptions.Item label="Website">
                  {leadData.company.website ? (
                    <>
                      <GlobalOutlined style={{ marginRight: 8 }} />
                      <a href={leadData.company.website} target="_blank" rel="noopener noreferrer">
                        {isMobile ? "Website Link" : leadData.company.website}
                      </a>
                    </>
                  ) : (
                    "N/A"
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        )}

        {leadData.geolocation && (
          <Col xs={24} lg={12}>
            <Card title="Geolocation">
              <Descriptions column={1} size={isMobile ? "small" : "default"}>
                <Descriptions.Item label="Country">
                  <EnvironmentOutlined style={{ marginRight: 8 }} />
                  {leadData.geolocation.country}
                </Descriptions.Item>
                <Descriptions.Item label="Region">{leadData.geolocation.region}</Descriptions.Item>
                <Descriptions.Item label="City">{leadData.geolocation.city}</Descriptions.Item>
                <Descriptions.Item label="Coordinates">
                  {leadData.geolocation.latitude}, {leadData.geolocation.longitude}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  )
}

export default LeadDetail