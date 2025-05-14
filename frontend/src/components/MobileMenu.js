"use client"

import { useState, useEffect } from "react"
import { Menu, Button, Drawer, Divider, Avatar } from "antd"
import { MenuOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const MobileMenu = ({ menuItems }) => {
  const [visible, setVisible] = useState(false)
  const location = useLocation()
  const { currentUser, logout } = useAuth()

  // Close drawer when route changes
  useEffect(() => {
    setVisible(false)
  }, [location.pathname])

  const showDrawer = () => {
    setVisible(true)
  }

  const onClose = () => {
    setVisible(false)
  }

  const handleLogout = () => {
    logout()
    setVisible(false)
  }

  // Only show menu button if user is logged in
  if (!currentUser) {
    return null
  }

  return (
    <>
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={showDrawer}
        style={{ color: " #001529" }}
        className="mobile-menu-button"
      />
      <Drawer
        title={
          <div className="mobile-menu-user-info">
            <Avatar icon={<UserOutlined />} />
            <span>{currentUser?.name || "User"}</span>
          </div>
        }
        placement="left"
        onClose={onClose}
        open={visible}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ padding: 0 }}
      >
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[
            location.pathname === "/"
              ? "1"
              : location.pathname.startsWith("/submit")
                ? "2"
                : location.pathname.startsWith("/leads")
                  ? "3"
                  : "",
          ]}
          items={menuItems.map((item) => ({
            ...item,
            label: <Link to={item.path}>{item.label}</Link>,
            onClick: onClose,
          }))}
        />
        <Divider style={{ margin: "12px 0" }} />
        <div className="mobile-menu-logout" onClick={handleLogout}>
          <LogoutOutlined style={{ marginRight: 10 }} />
          <span>Logout</span>
        </div>
      </Drawer>
    </>
  )
}

export default MobileMenu
