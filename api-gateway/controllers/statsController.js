const statsService = require("../services/statsService")

// Get lead statistics
exports.getLeadStats = async (req, res) => {
  try {
    const stats = await statsService.getLeadStats()
    res.json(stats)
  } catch (error) {
    console.error("Error fetching lead statistics:", error)
    res.status(500).json({ error: "Failed to fetch lead statistics" })
  }
}
