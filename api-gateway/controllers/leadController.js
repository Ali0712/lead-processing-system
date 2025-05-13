const leadService = require("../services/leadService")
const axios = require("axios")

async function getClientIp(req) {
  const ip = await axios.get("https://api.ipify.org?format=json")
  return ip.data.ip
}
// Submit a new lead
exports.submitLead = async (req, res) => {
  try {
    const leadData = req.body

    if (!leadData || !leadData.email) {
      return res.status(400).json({ error: "Lead data must include an email" })
    }
    const ip = await getClientIp(req)
    leadData.ip = ip

    const result = await leadService.submitLead(leadData)

    res.status(202).json({
      message: "Lead received and queued for processing",
      leadId: result.id || Date.now().toString(),
    })
  } catch (error) {
    console.error("Error processing lead:", error)
    res.status(500).json({ error: "Failed to process lead" })
  }
}

// Get all leads with filtering
exports.getLeads = async (req, res) => {
  try {
    const { search, dateRange, scoreRange, page = 1, limit = 10 } = req.query
    const filters = { search, dateRange, scoreRange }
    const pagination = { page: Number(page), limit: Number(limit) }

    const result = await leadService.getLeads(filters, pagination)

    res.json(result)
  } catch (error) {
    console.error("Error fetching leads:", error)
    res.status(500).json({ error: "Failed to fetch leads" })
  }
}

// Get a single lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const id = req.params.id

    if (!id) {
      return res.status(400).json({ error: "Lead ID is required" })
    }

    const lead = await leadService.getLeadById(id)

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" })
    }

    res.json(lead)
  } catch (error) {
    console.error("Error fetching lead:", error)
    res.status(500).json({ error: "Failed to fetch lead" })
  }
}
