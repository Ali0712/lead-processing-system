const { ObjectId } = require("mongodb")
const { getCollection } = require("../config/database")

// Submit a new lead to RabbitMQ
exports.submitLead = async (leadData) => {
  if (!global.rabbitmqChannel) {
    throw new Error("Message service unavailable")
  }

  global.rabbitmqChannel.sendToQueue("lead.validation", Buffer.from(JSON.stringify(leadData)), {
    persistent: true,
    contentType: "application/json",
  })

  console.log(`Lead sent to validation queue: ${leadData.email}`)

  return {
    id: leadData.id || Date.now().toString(),
  }
}

// Get all leads with filtering
exports.getLeads = async (filters, pagination) => {
  const leadsCollection = getCollection("leads")
  const { search, dateRange, scoreRange } = filters
  const { page, limit } = pagination

  const query = {}

  // Apply search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ]
  }

  // Apply date range filter
  if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
    query.createdAt = {
      $gte: new Date(dateRange[0]),
      $lte: new Date(dateRange[1]),
    }
  }

  // Apply score range filter
  if (scoreRange) {
    const [min, max] = scoreRange.split("-").map(Number)
    query.score = { $gte: min, $lte: max }
  }

  const skip = (page - 1) * limit

  const leads = await leadsCollection.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).toArray()

  const total = await leadsCollection.countDocuments(query)

  return {
    leads,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  }
}

// Get a single lead by ID
exports.getLeadById = async (id) => {
  const leadsCollection = getCollection("leads")

  try {
    return await leadsCollection.findOne({ _id: new ObjectId(id) })
  } catch (error) {
    console.error("Error in getLeadById:", error)
    return null
  }
}
