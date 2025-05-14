const jwt = require("jsonwebtoken")
const { ObjectId } = require("mongodb")
const { getCollection } = require("../config/database")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Middleware to authenticate JWT token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Check if token exists in the active tokens collection
    const tokensCollection = getCollection("tokens")
    const tokenExists = await tokensCollection.findOne({ token })

    if (!tokenExists) {
      return res.status(401).json({ message: "Token is not valid or has been revoked" })
    }

    // Add user from payload to request
    req.user = decoded

    // Verify user exists in database
    const usersCollection = getCollection("users")
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) })

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" })
    }

    res.status(500).json({ message: "Server error" })
  }
}

// Middleware to check if user has admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." })
  }
  next()
}

module.exports = { auth, adminOnly }
