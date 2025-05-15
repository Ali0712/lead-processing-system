require("dotenv").config({ path: "../.env" })
const validator = require("email-validator")
const { connectToRabbitMQ, consumeQueue } = require("./shared")

const rabbitmqUrl = "amqp://admin:admin@rabbitmq:5672"

// Validate lead data
function validateLead(lead) {
  // Basic validation rules
  if (!lead) return false

  // Check required fields
  if (!lead.email || !lead.name) {
    console.log("Missing required fields")
    return false
  }

  // Validate email format
  if (!validator.validate(lead.email)) {
    console.log("Invalid email format")
    return false
  }

  // Additional validation rules can be added here

  return true
}

// Process messages from validation queue
async function processValidationMessage(leadData, channel) {
  console.log(`Processing lead: ${leadData.email}`)

  // Validate lead data
  const isValid = validateLead(leadData)

  if (isValid) {
    // Send to cleaning queue
    channel.sendToQueue("lead.cleaning", Buffer.from(JSON.stringify(leadData)), {
      persistent: true,
      contentType: "application/json",
    })
    console.log(`Valid lead sent to cleaning queue: ${leadData.email}`)
  } else {
    console.log(`Invalid lead rejected: ${leadData.email}`)
    // Could send to a dead letter queue or log for review
  }
}

// Start the service
async function start() {
  const { channel } = await connectToRabbitMQ(rabbitmqUrl, ["lead.validation", "lead.cleaning"])

  if (channel) {
    await consumeQueue(channel, "lead.validation", processValidationMessage)
  }
}

start()

// Handle graceful shutdown
process.on("SIGINT", process.exit)
