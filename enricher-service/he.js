const axios = require("axios")
const NodeCache = require("node-cache")
// const { connectToRabbitMQ, consumeQueue } = require("./shared")

const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672"

// Simple cache to avoid repeated API calls
const cache = new NodeCache({ stdTTL: 3600 }) // 1 hour TTL

async function getGeolocationData(ip) {
  // Check cache first
  const cacheKey = `geo_${ip}`
  const cachedData = cache.get(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // For demo purposes, we'll simulate an API call
  // In a real application, you would use a service like ipstack or ipinfo
  console.log(`Simulating geolocation API call for IP: ${ip}`)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Mock geolocation data
  const geoData = {
    country: "United States",
    region: "California",
    city: "San Francisco",
    latitude: 37.7749,
    longitude: -122.4194,
  }

  // Cache the result
  cache.set(cacheKey, geoData)

  return geoData
}

async function getCompanyData(domain) {
  // Check cache first
  const cacheKey = `company_${domain}`
  const cachedData = cache.get(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // For demo purposes, we'll simulate an API call
  // In a real application, you would use a service like Clearbit or FullContact
  console.log(`Simulating company data API call for domain: ${domain}`)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 150))

  // Mock company data
  const companyData = {
    name: `${domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1)} Inc.`,
    industry: "Technology",
    size: "51-200 employees",
    founded: 2010,
    website: `https://www.${domain}`,
  }

  // Cache the result
  cache.set(cacheKey, companyData)

  return companyData
}

function calculateLeadScore(lead) {
  let score = 50 // Base score

  // Increase score if we have more data
  if (lead.phone) score += 10
  if (lead.company) score += 15
  if (lead.geolocation) score += 10

  // Adjust based on email domain (higher for business domains)
  if (lead.email) {
    const domain = lead.email.split("@")[1]
    if (domain && !domain.includes("gmail.com") && !domain.includes("yahoo.com") && !domain.includes("hotmail.com")) {
      score += 15
    }
  }

  return Math.min(score, 100) // Cap at 100
}

async function enrichLead(lead) {
  // Create a copy to avoid modifying the original
  const enrichedLead = { ...lead }

  // Add timestamp for when the lead was enriched
  enrichedLead.enrichedAt = new Date().toISOString()

  // Enrich with geolocation data if IP is available
  if (lead.ip) {
    try {
      const geoData = await getGeolocationData(lead.ip)
      if (geoData) {
        enrichedLead.geolocation = geoData
      }
    } catch (error) {
      console.error(`Error enriching with geolocation: ${error.message}`)
    }
  }

  // Enrich with company data if domain is available from email
  if (lead.email && lead.email.includes("@")) {
    try {
      const domain = lead.email.split("@")[1]
      const companyData = await getCompanyData(domain)
      if (companyData) {
        enrichedLead.company = companyData
      }
    } catch (error) {
      console.error(`Error enriching with company data: ${error.message}`)
    }
  }

  // Add lead score based on available data
  enrichedLead.score = calculateLeadScore(enrichedLead)

  return enrichedLead
}

// Process messages from enrichment queue
async function processEnrichmentMessage(leadData, channel) {
  console.log(`Enriching lead: ${leadData.email}`)

  // Enrich lead data
  const enrichedLead = await enrichLead(leadData)

  // Send to storage queue
  channel.sendToQueue("lead.storage", Buffer.from(JSON.stringify(enrichedLead)), {
    persistent: true,
    contentType: "application/json",
  })
  console.log(`Enriched lead sent to storage queue: ${enrichedLead.email}`)
}

// Start the service
async function start() {
  const { channel } = await connectToRabbitMQ(rabbitmqUrl, ["lead.enrichment", "lead.storage"])

  if (channel) {
    await consumeQueue(channel, "lead.enrichment", processEnrichmentMessage)
  }
}

start()

// Handle graceful shutdown
process.on("SIGINT", process.exit)
