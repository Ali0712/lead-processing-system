require("dotenv").config({ path: "../.env" })
const { MongoClient } = require("mongodb")
const { connectToRabbitMQ, consumeQueue } = require("./shared")

const rabbitmqUrl = "amqp://admin:admin@rabbitmq:5672"
const mongodbUri = process.env.MONGODB_URI
// MongoDB connection
let db
let leadsCollection

async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    await client.connect()

    db = client.db("leads")
    leadsCollection = db.collection("leads")

    console.log("Connected to MongoDB Atlas")

    // Create indexes for better query performance
    await leadsCollection.createIndex({ email: 1 }, { unique: true })
    await leadsCollection.createIndex({ createdAt: 1 })
    await leadsCollection.createIndex({ score: 1 })

    return client
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message)
    throw error
  }
}

async function storeLead(lead) {
  try {
    // Use upsert to update if exists or insert if not
    const result = await leadsCollection.updateOne({ email: lead.email }, { $set: lead }, { upsert: true })

    if (result.upsertedCount > 0) {
      console.log(`Inserted new lead: ${lead.email}`)
    } else if (result.modifiedCount > 0) {
      console.log(`Updated existing lead: ${lead.email}`)
    } else {
      console.log(`No changes for lead: ${lead.email}`)
    }

    return result
  } catch (error) {
    console.error(`Error storing lead in database: ${error.message}`)
    throw error
  }
}

// Process messages from storage queue
async function processStorageMessage(leadData) {
  console.log(`Storing lead in database: ${leadData.email}`)

  // Add created timestamp if not present
  if (!leadData.createdAt) {
    leadData.createdAt = new Date().toISOString()
  }

  // Store in MongoDB
  await storeLead(leadData)

  console.log(`Lead stored successfully: ${leadData.email}`)
}

// Start the service
async function start() {
  try {
    // Connect to MongoDB
    await connectToMongoDB()

    // Connect to RabbitMQ
    const { channel } = await connectToRabbitMQ(rabbitmqUrl, ["lead.storage"])

    // wait for 10 seconds before consuming the queue
    // await new Promise((resolve) => setTimeout(resolve, 3000))

    if (channel) {
      await consumeQueue(channel, "lead.storage", processStorageMessage)
    }
  } catch (error) {
    console.error("Failed to start service:", error)
    process.exit(1)
  }
}

start()

// Handle graceful shutdown
process.on("SIGINT", async () => {
  if (db) {
    await db.client.close()
  }
  process.exit(0)
})
