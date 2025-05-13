const amqp = require("amqplib")

/**
 * Creates a connection to RabbitMQ and returns the channel
 * @param {string} url - RabbitMQ connection URL
 * @param {string[]} queues - Array of queue names to assert
 * @param {Function} onConnect - Callback function to execute after successful connection
 * @returns {Promise<{connection: object, channel: object}>} The RabbitMQ connection and channel
 */
async function connectToRabbitMQ(url, queues = [], onConnect = null) {
  try {
    const connection = await amqp.connect(url)
    const channel = await connection.createChannel()

    // Assert all required queues
    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: true })
    }

    console.log("Connected to RabbitMQ")

    // Handle connection close and reconnect
    connection.on("close", () => {
      console.log("RabbitMQ connection closed, trying to reconnect...")
      setTimeout(() => connectToRabbitMQ(url, queues, onConnect), 5000)
    })

    // If callback is provided, execute it
    if (onConnect && typeof onConnect === "function") {
      onConnect(channel)
    }

    return { connection, channel }
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error.message)
    // Retry connection after delay
    setTimeout(() => connectToRabbitMQ(url, queues, onConnect), 5000)
    return { connection: null, channel: null }
  }
}

/**
 * Consumes messages from a queue
 * @param {object} channel - RabbitMQ channel
 * @param {string} queueName - Name of the queue to consume from
 * @param {Function} processMessage - Function to process the message
 * @returns {Promise<void>}
 */
async function consumeQueue(channel, queueName, processMessage) {
  try {
    await channel.consume(queueName, async (message) => {
      if (message) {
        try {
          const data = JSON.parse(message.content.toString())
          await processMessage(data, channel)
          channel.ack(message)
        } catch (error) {
          console.error(`Error processing message from ${queueName}:`, error)
          // Reject the message and don't requeue
          channel.nack(message, false, false)
        }
      }
    })

    console.log(`Service is listening for messages on queue: ${queueName}`)
  } catch (error) {
    console.error(`Error consuming from queue ${queueName}:`, error)
    throw error
  }
}

module.exports = {
  connectToRabbitMQ,
  consumeQueue,
}
