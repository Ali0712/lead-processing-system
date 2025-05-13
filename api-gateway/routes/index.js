const express = require("express")
const leadController = require("../controllers/leadController")
const statsController = require("../controllers/statsController")

const router = express.Router()

// Lead routes
router.post("/lead", leadController.submitLead)
router.get("/leads", leadController.getLeads)
router.get("/leads/stats", statsController.getLeadStats)
router.get("/leads/:id", leadController.getLeadById)

module.exports = router
