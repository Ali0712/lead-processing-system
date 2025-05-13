require("dotenv").config({path: "../.env"})
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const { connectToRabbitMQ } = require("../shared/rabbitmq")
const config = require("./config")
const routes = require("./routes")
const { connectToMongoDB } = require("./config/database")

const app = express()
const port = process.env.PORT

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
    await connectToMongoDB()

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
