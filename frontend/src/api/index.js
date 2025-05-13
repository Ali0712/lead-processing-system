import axios from "axios"

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
})

// API functions for leads
export const leadsApi = {
  // Submit a new lead
  submitLead: async (leadData) => {
    const response = await api.post("/lead", leadData)
    return response.data
  },

  // Get all leads with optional filters
  getLeads: async (params) => {
    const response = await api.get("/leads", { params })
    return response.data
  },

  // Get a single lead by ID
  getLead: async (id) => {
    const response = await api.get(`/leads/${id}`)
    return response.data
  },

  // Get lead statistics
  getStats: async () => {
    const response = await api.get("/leads/stats")
    return response.data
  },
}

export default api
