"use client"

import { useState } from "react"
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom"
import { Layout, Menu, Button, theme, Dropdown, Avatar, Space, Tooltip } from "antd"
import {
  DashboardOutlined,
  FormOutlined,
  UnorderedListOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons"

import Dashboard from "./pages/Dashboard"
import LeadForm from "./pages/LeadForm"
import LeadsList from "./pages/LeadsList"
import LeadDetail from "./pages/LeadDetail"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import PublicLeadForm from "./pages/PublicLeadForm"
import ProtectedRoute from "./components/ProtectedRoute"
import MobileMenu from "./components/MobileMenu"
import { AuthProvider, useAuth } from "./context/AuthContext"
import useResponsive from "./hooks/useResponsive"

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: "1",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    path: "/",
  },
  {
    key: "2",
    icon: <FormOutlined />,
    label: "Submit Lead",
    path: "/submit",
  },
  {
    key: "3",
    icon: <UnorderedListOutlined />,
    label: "Leads",
    path: "/leads",
  },
]

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { currentUser, logout } = useAuth()
  const { isMobile } = useResponsive()
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

  const handleLogout = () => {
    logout()
  }

  const userMenuItems = [
    {
      key: "1",
      label: "Profile Settings",
      icon: <SettingOutlined />,
    },
    {
      key: "2",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ]

  return (
    <Layout>
      {!isMobile && (
        <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="lg" collapsedWidth="80">
          <div className="logo">{!collapsed ? "Lead System" : "LS"}</div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[getSelectedKey()]}
            selectedKeys={[getSelectedKey()]}
            items={menuItems.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: <Link to={item.path}>{item.label}</Link>,
            }))}
          />
          {collapsed ? (
            <Tooltip title="Logout" placement="right">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="sidebar-logout-button"
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "rgba(255, 255, 255, 0.65)",
                }}
              />
            </Tooltip>
          ) : (
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="sidebar-logout-button"
              style={{
                position: "absolute",
                bottom: "20px",
                left: "16px",
                right: "16px",
                color: "rgba(255, 255, 255, 0.65)",
                justifyContent: "flex-start",
                textAlign: "left",
              }}
            >
              Logout
            </Button>
          )}
        </Sider>
      )}
      <Layout>
        <Header style={{ background: colorBgContainer, padding: isMobile ? "0 16px" : "0 24px" }}>
          {isMobile ? (
            <MobileMenu menuItems={menuItems} />
          ) : (
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
          )}
          <div className="header-title" style={{color: "#001529"}}>Lead System</div>
          <div style={{ marginRight: isMobile ? 0 : 16 }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} />
                {!isMobile && <span>{currentUser?.name || "Admin"}</span>}
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: isMobile ? "16px 8px" : "24px 16px",
            padding: isMobile ? 16 : 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      {/* <Route path="/signup" element={<Signup />} /> */}
      <Route path="/public/submit" element={<PublicLeadForm />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/submit"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <LeadForm />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <LeadsList />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <LeadDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect any unknown routes to dashboard if logged in, or login page if not */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
