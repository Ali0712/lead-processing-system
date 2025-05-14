"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import { Link } from "react-router-dom"
import { Input, Button, Space, Tag, Card, Select, DatePicker, Row, Col } from "antd"
import { SearchOutlined, SyncOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import { leadsApi } from "../api"
import useResponsive from "../hooks/useResponsive"
import ResponsiveTable from "../components/ResponsiveTable"

const { Option } = Select
const { RangePicker } = DatePicker

const LeadsList = () => {
  const { isMobile } = useResponsive()
  const [filters, setFilters] = useState({
    search: "",
    dateRange: null,
    scoreRange: null,
  })

  const { data, isLoading, error, refetch } = useQuery(["leads", filters], () => leadsApi.getLeads(filters), {
    keepPreviousData: true,
  })

  // Mock data for development until API is ready
  const mockLeads = [
    {
      _id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      company: "Acme Inc",
      score: 85,
      source: "Website",
      createdAt: "2023-09-01T10:30:00Z",
      cleanedAt: "2023-09-01T10:30:05Z",
      enrichedAt: "2023-09-01T10:30:10Z",
    },
    {
      _id: "2",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      company: "Company LLC",
      score: 72,
      source: "Referral",
      createdAt: "2023-09-02T14:20:00Z",
      cleanedAt: "2023-09-02T14:20:05Z",
      enrichedAt: "2023-09-02T14:20:10Z",
    },
    {
      _id: "3",
      name: "Bob Johnson",
      email: "bob@gmail.com",
      company: null,
      score: 45,
      source: "Social Media",
      createdAt: "2023-09-03T09:15:00Z",
      cleanedAt: "2023-09-03T09:15:05Z",
      enrichedAt: "2023-09-03T09:15:10Z",
    },
    {
      _id: "4",
      name: "Alice Williams",
      email: "alice@techcorp.com",
      company: "TechCorp",
      score: 92,
      source: "Email",
      createdAt: "2023-09-04T16:45:00Z",
      cleanedAt: "2023-09-04T16:45:05Z",
      enrichedAt: "2023-09-04T16:45:10Z",
    },
    {
      _id: "5",
      name: "Charlie Brown",
      email: "charlie@example.org",
      company: "Nonprofit Org",
      score: 63,
      source: "Website",
      createdAt: "2023-09-05T11:30:00Z",
      cleanedAt: "2023-09-05T11:30:05Z",
      enrichedAt: "2023-09-05T11:30:10Z",
    },
  ]

  const leads = data?.leads || mockLeads

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value })
  }

  const handleDateRangeChange = (dates) => {
    setFilters({
      ...filters,
      dateRange: dates ? [dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")] : null,
    })
  }

  const handleScoreRangeChange = (value) => {
    setFilters({ ...filters, scoreRange: value })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "green"
    if (score >= 60) return "blue"
    if (score >= 40) return "orange"
    return "red"
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => <Link to={`/leads/${record._id}`}>{text}</Link>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["md"],
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      render: (text) => text || "-",
      responsive: ["lg"],
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      sorter: (a, b) => a.score - b.score,
      render: (score) => <Tag color={getScoreColor(score)}>{score}</Tag>,
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      filters: [
        { text: "Website", value: "Website" },
        { text: "Referral", value: "Referral" },
        { text: "Social Media", value: "Social Media" },
        { text: "Email", value: "Email" },
      ],
      onFilter: (value, record) => record.source === value,
      responsive: ["md"],
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
      responsive: ["lg"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">
            <Link to={`/leads/${record._id}`}>View</Link>
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h1 style={{ fontSize: isMobile ? "20px" : "24px" }}>Leads List</h1>

      <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: isMobile ? 12 : 24 }}>
        <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]} align="middle">
          <Col xs={24} md={8}>
            <Input.Search
              placeholder="Search by name, email, or company"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              size={isMobile ? "middle" : "large"}
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={handleDateRangeChange}
              placeholder={["Start Date", "End Date"]}
              size={isMobile ? "middle" : "large"}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Score Range"
              allowClear
              onChange={handleScoreRangeChange}
              size={isMobile ? "middle" : "large"}
            >
              <Option value="0-40">Low (0-40)</Option>
              <Option value="41-70">Medium (41-70)</Option>
              <Option value="71-100">High (71-100)</Option>
            </Select>
          </Col>
          <Col xs={24} md={2} style={{ textAlign: isMobile ? "left" : "right" }}>
            <Button
              icon={<SyncOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
              size={isMobile ? "middle" : "large"}
            />
          </Col>
        </Row>
      </Card>

      <ResponsiveTable
        dataSource={leads}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          defaultPageSize: isMobile ? 5 : 10,
          showSizeChanger: !isMobile,
          pageSizeOptions: ["5", "10", "20", "50"],
          size: isMobile ? "small" : "default",
        }}
      />
    </div>
  )
}

export default LeadsList
