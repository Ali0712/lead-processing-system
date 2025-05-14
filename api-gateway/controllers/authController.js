const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { ObjectId } = require("mongodb")
const { getCollection } = require("../config/database")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const TOKEN_EXPIRY = "24h"

// User signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const usersCollection = getCollection("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin", // Default role
      createdAt: new Date(),
      lastLogin: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    // Return success without sensitive data
    res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId,
    })
  } catch (error) {
    console.error("Error in signup:", error)
    res.status(500).json({ message: "Server error during signup" })
  }
}

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const usersCollection = getCollection("users")

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Update last login time
    await usersCollection.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY },
    )

    // Add token to active tokens collection
    const tokensCollection = getCollection("tokens")
    await tokensCollection.insertOne({
      userId: user._id,
      token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    })

    // Return user info and token (without password)
    const { password: _, ...userWithoutPassword } = user
    res.json({
      ...userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Error in login:", error)
    res.status(500).json({ message: "Server error during login" })
  }
}

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const usersCollection = getCollection("users")
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    console.error("Error getting current user:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Logout user
exports.logout = async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ message: "No token provided" })
    }

    const token = authHeader.split(" ")[1]

    // Remove token from active tokens collection
    const tokensCollection = getCollection("tokens")
    await tokensCollection.deleteOne({ token })

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Error in logout:", error)
    res.status(500).json({ message: "Server error during logout" })
  }
}

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" })
    }

    const usersCollection = getCollection("users")
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword, updatedAt: new Date() } },
    )

    // Invalidate all existing tokens for this user
    const tokensCollection = getCollection("tokens")
    await tokensCollection.deleteMany({ userId: new ObjectId(userId) })

    res.json({ message: "Password changed successfully. Please login again." })
  } catch (error) {
    console.error("Error changing password:", error)
    res.status(500).json({ message: "Server error during password change" })
  }
}
