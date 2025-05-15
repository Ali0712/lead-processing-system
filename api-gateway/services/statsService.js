const { getCollection } = require("../config/database")

// Get lead statistics
exports.getLeadStats = async () => {
  const leadsCollection = getCollection("leads")

  // Get total leads count
  const totalLeads = await leadsCollection.countDocuments()

  // Get processed leads (those with a score)
  const processedLeads = await leadsCollection.countDocuments({ score: { $exists: true } })

  // Get pending leads
  const pendingLeads = totalLeads - processedLeads

  // Get average score
  const scoreResult = await leadsCollection
    .aggregate([{ $match: { score: { $exists: true } } }, { $group: { _id: null, averageScore: { $avg: "$score" } } }])
    .toArray()

  const averageScore = scoreResult.length > 0 ? Math.round(scoreResult[0].averageScore) : 0

  // Get leads by day for the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const leadsByDayResult = await leadsCollection.aggregate([
    { 
      $match: { 
        createdAt: { 
          $gte: sevenDaysAgo.toISOString() 
        } 
      } 
    },
    {
      $addFields: {
        createdAtDate: { 
          $dateFromString: { 
            dateString: "$createdAt",
            // Adjust format to match your actual string format:
            format: "%Y-%m-%dT%H:%M:%S.%LZ" // ISO format example
            // format: "%m/%d/%Y %H:%M"     // US format example
          } 
        }
      }
    },
    {
      $group: {
        _id: { 
          $dateToString: { 
            format: "%Y-%m-%d", 
            date: "$createdAtDate",
            timezone: "America/New_York" // Optional timezone
          } 
        },
        count: { $sum: 1 },
      }
    },
    { $sort: { _id: 1 } },
  ]).toArray();


  const leadsByDay = leadsByDayResult.map((item) => ({
    date: item._id,
    count: item.count,
  }))

  // Get leads by source
  const leadsBySourceResult = await leadsCollection
    .aggregate([{ $group: { _id: "$source", value: { $sum: 1 } } }])
    .toArray()

  const leadsBySource = leadsBySourceResult.map((item) => ({
    type: item._id || "Unknown",
    value: item.value,
  }))

  // Get score distribution
  const scoreDistribution = [
    { score: "0-20", count: await leadsCollection.countDocuments({ score: { $gte: 0, $lte: 20 } }) },
    { score: "21-40", count: await leadsCollection.countDocuments({ score: { $gt: 20, $lte: 40 } }) },
    { score: "41-60", count: await leadsCollection.countDocuments({ score: { $gt: 40, $lte: 60 } }) },
    { score: "61-80", count: await leadsCollection.countDocuments({ score: { $gt: 60, $lte: 80 } }) },
    { score: "81-100", count: await leadsCollection.countDocuments({ score: { $gt: 80, $lte: 100 } }) },
  ]

  return {
    totalLeads,
    processedLeads,
    pendingLeads,
    averageScore,
    leadsByDay,
    leadsBySource,
    scoreDistribution,
  }
}
