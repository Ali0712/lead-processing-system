"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)

          // Set auth token for API calls
          api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`

          // Verify token is still valid with the server
          try {
            await api.get("/auth/me")
            setCurrentUser(user)
          } catch (err) {
            console.error("Token validation failed:", err)
            localStorage.removeItem("user")
            delete api.defaults.headers.common["Authorization"]
          }
        } catch (err) {
          console.error("Error parsing stored user:", err)
          localStorage.removeItem("user")
        }
      }
      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      setError(null)
      const response = await api.post("/auth/login", { email, password })
      const user = response.data

      // Store user in state and localStorage
      setCurrentUser(user)
      localStorage.setItem("user", JSON.stringify(user))

      // Set auth token for API calls
      api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`

      return user
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      throw err
    }
  }

  // Signup function
  const signup = async (name, email, password) => {
    try {
      setError(null)
      const response = await api.post("/auth/signup", { name, email, password })
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed")
      throw err
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post("/auth/logout")
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      // Clear user data regardless of server response
      setCurrentUser(null)
      localStorage.removeItem("user")
      delete api.defaults.headers.common["Authorization"]
      navigate("/login")
    }
  }

  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
