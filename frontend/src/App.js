"use client"

import { useState } from "react"
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { Layout, Menu, Button, theme } from "antd"
import {
  DashboardOutlined,
  FormOutlined,
  UnorderedListOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons"

import Dashboard from "./pages/Dashboard"
import LeadForm from "./pages/LeadForm"
import LeadsList from "./pages/LeadsList"
import LeadDetail from "./pages/LeadDetail"

const { Header, Sider, Content } = Layout

const App = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === "/") return "1"
    if (path.startsWith("/submit")) return "2"
    if (path.startsWith("/leads")) return "3"
    return "1"
  }

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">{!collapsed ? "LeadSystem" : "LS"}</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[getSelectedKey()]}
          selectedKeys={[getSelectedKey()]}
          items={[
            {
              key: "1",
              icon: <DashboardOutlined />,
              label: <Link to="/">Dashboard</Link>,
            },
            {
              key: "2",
              icon: <FormOutlined />,
              label: <Link to="/submit">Submit Lead</Link>,
            },
            {
              key: "3",
              icon: <UnorderedListOutlined />,
              label: <Link to="/leads">Leads</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer, padding: 0 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <div className="header-title">Lead Processing System</div>
          <div style={{ marginRight: 16 }}>
            <Button type="text" icon={<UserOutlined />}>
              Admin
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/submit" element={<LeadForm />} />
            <Route path="/leads" element={<LeadsList />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
