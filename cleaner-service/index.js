require("dotenv").config({path: "../.env"})
const { parsePhoneNumberFromString } = require("libphonenumber-js")
const { connectToRabbitMQ, consumeQueue } = require("../shared/rabbitmq")

const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://admin:admin@rabbitmq:5672"

// Clean lead data
function cleanLead(lead) {
  // Create a copy to avoid modifying the original
  const cleanedLead = { ...lead }

  // Trim whitespace from string fields
  Object.keys(cleanedLead).forEach((key) => {
    if (typeof cleanedLead[key] === "string") {
      cleanedLead[key] = cleanedLead[key].trim()
    }
  })

  // Normalize email to lowercase
  if (cleanedLead.email) {
    cleanedLead.email = cleanedLead.email.toLowerCase()
  }

  // Format phone number if present
  if (cleanedLead.phone) {
    try {
      const phoneNumber = parsePhoneNumberFromString(cleanedLead.phone, "US")
      if (phoneNumber) {
        cleanedLead.phone = phoneNumber.formatInternational()
      }
    } catch (error) {
      console.log(`Could not format phone number: ${cleanedLead.phone}`)
    }
  }

  // Normalize name (capitalize first letter of each word)
  if (cleanedLead.name) {
    cleanedLead.name = cleanedLead.name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ")
  }

  // Add timestamp for when the lead was cleaned
  cleanedLead.cleanedAt = new Date().toISOString()

  return cleanedLead
}

// Process messages from cleaning queue
async function processCleaningMessage(leadData, channel) {
  console.log(`Cleaning lead: ${leadData.email}`)

  // Clean lead data
  const cleanedLead = cleanLead(leadData)

  // Send to enrichment queue
  channel.sendToQueue("lead.enrichment", Buffer.from(JSON.stringify(cleanedLead)), {
    persistent: true,
    contentType: "application/json",
  })
  console.log(`Cleaned lead sent to enrichment queue: ${cleanedLead.email}`)
}

// Start the service
async function start() {
  const { channel } = await connectToRabbitMQ(rabbitmqUrl, ["lead.cleaning", "lead.enrichment"])

  // wait for 10 seconds before consuming the queue
  await new Promise((resolve) => setTimeout(resolve, 10000))

  if (channel) {
    await consumeQueue(channel, "lead.cleaning", processCleaningMessage)
  }
}

start()

// Handle graceful shutdown
process.on("SIGINT", process.exit(0))
