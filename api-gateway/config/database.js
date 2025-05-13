const { MongoClient } = require("mongodb")
const config = require("./index")

let db
let leadsCollection

async function connectToMongoDB() {
  try {
    const client = new MongoClient(config.mongodb.uri, config.mongodb.options)
    await client.connect()

    global.mongoClient = client
    db = client.db("leads")
    leadsCollection = db.collection("leads")

    console.log("Connected to MongoDB Atlas")

    // Create indexes for better query performance
    await leadsCollection.createIndex({ email: 1 }, { unique: true })
    await leadsCollection.createIndex({ createdAt: 1 })
    await leadsCollection.createIndex({ score: 1 })

    return { db, leadsCollection }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message)
    throw error
  }
}

function getDB() {
  return db
}

function getCollection(name = "leads") {
  return db.collection(name)
}

module.exports = {
  connectToMongoDB,
  getDB,
  getCollection,
}
