const express = require("express")
const leadController = require("../controllers/leadController")
const statsController = require("../controllers/statsController")
const authController = require("../controllers/authController")
const { auth, adminOnly } = require("../middleware/auth")

const router = express.Router()

// Public routes
router.post("/lead", leadController.submitLead) // Public lead submission
router.post("/auth/signup", authController.signup)
router.post("/auth/login", authController.login)

// Authentication routes
router.get("/auth/me", auth, authController.getCurrentUser)
router.post("/auth/logout", auth, authController.logout)
router.post("/auth/change-password", auth, authController.changePassword)

// Protected routes
router.get("/leads", auth, leadController.getLeads)
router.get("/leads/stats", auth, statsController.getLeadStats)
router.get("/leads/:id", auth, leadController.getLeadById)

module.exports = router
