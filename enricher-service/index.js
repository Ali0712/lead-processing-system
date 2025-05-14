require("dotenv").config({ path: "../.env" })
const axios = require("axios")
const NodeCache = require("node-cache")
const { connectToRabbitMQ, consumeQueue } = require("./shared")

const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672"
const cache = new NodeCache({ stdTTL: 3600 }) // 1 hour TTL

// ----------------- GET GEOLOCATION DATA -----------------
async function getGeolocationData(ip) {
  const cacheKey = `geo_${ip}`
  const cachedData = cache.get(cacheKey)
  if (cachedData) return cachedData

  try {
    const { data } = await axios.get(`http://ip-api.com/json/${ip}`)
    if (data.status === "success") {
      const geo = {
        country: data.country,
        region: data.regionName,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
        isp: data.isp,
      }
      cache.set(cacheKey, geo)
      return geo
    }
  } catch (error) {
    console.error("Geolocation error:", error.message)
  }

  return null
}

// ----------------- GET COMPANY DATA -----------------
async function getCompanyData(name, domain) {
  const cacheKey = `company_${domain}`
  const cachedData = cache.get(cacheKey)
  if (cachedData) return cachedData

  try {
    const name = domain.split(".")[0].replace(/[^a-zA-Z]/g, "")
    // get company size like 20-30 50-70 etc
    const companySize = Math.floor(Math.random() * 100) + 1
    const companySizeRange = `${companySize}-${companySize + 50} employees`
    const year = Math.floor(Math.random() * 20) + 2000
    const company = {
      name: name || `${name.charAt(0).toUpperCase() + name.slice(1)} Inc.`,
      industry: "Technology",
      size: companySizeRange,
      founded: year,
      website: `https://${domain}`,
    }
    cache.set(cacheKey, company)
    return company
  } catch (error) {
    console.error("Company enrichment error:", error.message)
  }

  return null
}

// ----------------- SCORING -----------------
function calculateLeadScore(lead) {
  let score = 40

  if (lead.phone) score += 7
  if (lead.company?.name) score += 10
  if (lead.geolocation?.country) score += 5
  if (lead.geolocation?.city) score += 3
  if (lead.website) score += 5
  if (lead.source === "Referral") score += 10

  // Business domain check
  if (lead.email) {
    const domain = lead.email.split("@")[1]
    if (!/(gmail|yahoo|hotmail|outlook)\.com/.test(domain)) {
      score += 10
    }
  }

  // Add slight randomization for uniqueness
  score += Math.floor(Math.random() * 6) // Add 0–5 randomly

  return Math.min(score, 100)
}

// ----------------- ENRICH LEAD -----------------
async function enrichLead(lead) {
  const enriched = { ...lead, enrichedAt: new Date().toISOString() }

  if (lead.ip) {
    const geo = await getGeolocationData(lead.ip)
    if (geo) enriched.geolocation = geo
  }

  if (lead.email && lead.email.includes("@")) {
    const domain = lead.email.split("@")[1]
    const company = await getCompanyData(lead.company, domain)
    if (company) enriched.company = company
  }

  enriched.score = calculateLeadScore(enriched)

  return enriched
}

// ----------------- PROCESS MESSAGE -----------------
async function processEnrichmentMessage(leadData, channel) {
  console.log(`Enriching lead: ${leadData.email}`)

  const enrichedLead = await enrichLead(leadData)

  channel.sendToQueue("lead.storage", Buffer.from(JSON.stringify(enrichedLead)), {
    persistent: true,
    contentType: "application/json",
  })

  console.log(`Enriched lead sent to storage queue: ${enrichedLead.email}`)
}

// ----------------- START SERVICE -----------------
async function start() {
  const { channel } = await connectToRabbitMQ(rabbitmqUrl, ["lead.enrichment", "lead.storage"])

  // wait for 10 seconds before consuming the queue
  await new Promise((resolve) => setTimeout(resolve, 10000))

  if (channel) {
    await consumeQueue(channel, "lead.enrichment", processEnrichmentMessage)
  }
}

start()

process.on("SIGINT", process.exit)
