import { useQuery } from "react-query"
import { Row, Col, Card, Statistic, Spin, Alert, Divider } from "antd"
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, LineChartOutlined } from "@ant-design/icons"
import { Line, Pie, Column } from "@ant-design/plots"
import { leadsApi } from "../api"
import useResponsive from "../hooks/useResponsive"

const Dashboard = () => {
  const { isMobile } = useResponsive()
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery("leadStats", leadsApi.getStats, {
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p>Loading dashboard data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description="Failed to load dashboard data. Please try again later."
        type="error"
        showIcon
      />
    )
  }

  // Use mock data if API is not yet implemented
  const mockStats = {
    totalLeads: 256,
    processedLeads: 243,
    pendingLeads: 13,
    averageScore: 72,
    leadsByDay: [
      { date: "2023-09-01", count: 12 },
      { date: "2023-09-02", count: 18 },
      { date: "2023-09-03", count: 15 },
      { date: "2023-09-04", count: 21 },
      { date: "2023-09-05", count: 25 },
      { date: "2023-09-06", count: 22 },
      { date: "2023-09-07", count: 30 },
    ],
    leadsBySource: [
      { type: "Website", value: 120 },
      { type: "Referral", value: 80 },
      { type: "Social Media", value: 40 },
      { type: "Email", value: 16 },
    ],
    scoreDistribution: [
      { score: "0-20", count: 10 },
      { score: "21-40", count: 25 },
      { score: "41-60", count: 55 },
      { score: "61-80", count: 80 },
      { score: "81-100", count: 86 },
    ],
  }

  const data = stats || mockStats

  const lineConfig = {
    data: data.leadsByDay,
    xField: "date",
    yField: "count",
    point: {
      size: 5,
      shape: "diamond",
    },
    label: {
      style: {
        fill: "#aaa",
      },
    },
    // Mobile optimizations
    padding: isMobile ? "auto" : [30, 30, 50, 50],
    autoFit: true,
    tooltip: {
      showMarkers: false,
    },
    interactions: [{ type: "element-active" }],
  }

  const pieConfig = {
    data: data.leadsBySource,
    angleField: "value",
    colorField: "type",
    radius: isMobile ? 0.7 : 0.8,
    label: {
      type: "outer",
      content: isMobile ? "{name}" : "{name} {percentage}",
      style: {
        fontSize: isMobile ? 10 : 12,
      },
    },
    legend: {
      position: isMobile ? "bottom" : "right",
      itemHeight: isMobile ? 16 : 20,
    },
    tooltip: {
      showTitle: false,
    },
    interactions: [
      {
        type: "element-active",
      },
    ],
  }

  const scoreConfig = {
    data: data.scoreDistribution,
    xField: "score",
    yField: "count",
    color: "#1890ff",
    label: {
      position: isMobile ? "top" : "middle",
      style: {
        fill: isMobile ? "#000000" : "#FFFFFF",
        opacity: isMobile ? 1 : 0.6,
        fontSize: isMobile ? 10 : 12,
      },
    },
    // Mobile optimizations
    padding: isMobile ? "auto" : [30, 30, 50, 50],
    autoFit: true,
    meta: {
      score: {
        alias: "Score Range",
      },
      count: {
        alias: "Number of Leads",
      },
    },
  }

  return (
    <div>
      <h1 style={{ fontSize: isMobile ? "20px" : "24px" }}>Dashboard</h1>
      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
        <Col xs={12} sm={12} md={6}>
          <Card className="stats-card" bodyStyle={{ padding: isMobile ? "12px 8px" : "24px" }}>
            <Statistic title="Total Leads" value={data.totalLeads} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stats-card" bodyStyle={{ padding: isMobile ? "12px 8px" : "24px" }}>
            <Statistic
              title="Processed Leads"
              value={data.processedLeads}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stats-card" bodyStyle={{ padding: isMobile ? "12px 8px" : "24px" }}>
            <Statistic
              title="Pending Leads"
              value={data.pendingLeads}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stats-card" bodyStyle={{ padding: isMobile ? "12px 8px" : "24px" }}>
            <Statistic title="Average Score" value={data.averageScore} prefix={<LineChartOutlined />} suffix="/ 100" />
          </Card>
        </Col>
      </Row>

      <Divider
        orientation="left"
        style={{ fontSize: isMobile ? "14px" : "16px", margin: isMobile ? "16px 0" : "24px 0" }}
      >
        Lead Trends
      </Divider>

      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
        <Col xs={24} lg={12}>
          <Card title="Leads by Day" className="dashboard-card" bodyStyle={{ padding: isMobile ? 8 : 24 }}>
            <div className="chart-container" style={{ height: isMobile ? "200px" : "300px" }}>
              <Line {...lineConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Leads by Source" className="dashboard-card" bodyStyle={{ padding: isMobile ? 8 : 24 }}>
            <div className="chart-container" style={{ height: isMobile ? "200px" : "300px" }}>
              <Pie {...pieConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      <Divider
        orientation="left"
        style={{ fontSize: isMobile ? "14px" : "16px", margin: isMobile ? "16px 0" : "24px 0" }}
      >
        Lead Score Distribution
      </Divider>

      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
        <Col xs={24}>
          <Card title="Lead Score Distribution" className="dashboard-card" bodyStyle={{ padding: isMobile ? 8 : 24 }}>
            <div className="chart-container" style={{ height: isMobile ? "200px" : "300px" }}>
              <Column {...scoreConfig} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
