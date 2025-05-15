require("dotenv").config({path: "../.env"})
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const { connectToRabbitMQ } = require("./shared")
const config = require("./config")
const routes = require("./routes")
const { connectToMongoDB } = require("./config/database")

const app = express()
const port = process.env.PORT || 3000

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3001",
      "https://your-frontend-app.vercel.app", // Add your deployed frontend URL
      "https://your-ngrok-url.ngrok.io", // Add your ngrok URL when testing
    ]

    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

// Routes
app.use("/", routes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    const { db } = await connectToMongoDB()

    // Create necessary collections and indexes
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Create users collection if it doesn't exist
    if (!collectionNames.includes("users")) {
      await db.createCollection("users")
      await db.collection("users").createIndex({ email: 1 }, { unique: true })
    }

    // Create tokens collection if it doesn't exist
    if (!collectionNames.includes("tokens")) {
      await db.createCollection("tokens")
      await db.collection("tokens").createIndex({ token: 1 }, { unique: true })
      await db.collection("tokens").createIndex({ userId: 1 })
      await db.collection("tokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index
    }

    // Connect to RabbitMQ
    const { channel } = await connectToRabbitMQ(config.rabbitmq.url, ["lead.validation"], (ch) => {
      global.rabbitmqChannel = ch
    })

    if (channel) {
      global.rabbitmqChannel = channel
    }

    // Start Express server
    app.listen(port, () => {
      console.log(`API Gateway listening on port ${port}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

// Handle graceful shutdown
process.on("SIGINT", async () => {
  if (global.rabbitmqChannel) {
    await global.rabbitmqChannel.close()
  }
  if (global.mongoClient) {
    await global.mongoClient.close()
  }
  process.exit(0)
})
