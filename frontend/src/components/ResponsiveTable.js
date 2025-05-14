"use client"

import { Table } from "antd"
import { useState, useEffect } from "react"

const ResponsiveTable = (props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Adjust columns for mobile
  const getResponsiveColumns = () => {
    if (isMobile) {
      // Keep only essential columns for mobile view
      return props.columns.filter(
        (col) => col.key === "name" || col.key === "email" || col.key === "score" || col.key === "actions",
      )
    }
    return props.columns
  }

  return (
    <div className="responsive-table">
      <Table
        {...props}
        columns={getResponsiveColumns()}
        scroll={{ x: "max-content" }}
        pagination={
          isMobile
            ? {
                simple: true,
                pageSize: 5,
                showSizeChanger: false,
              }
            : props.pagination
        }
      />
    </div>
  )
}

export default ResponsiveTable
