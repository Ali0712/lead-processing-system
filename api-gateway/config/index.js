module.exports = {
  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://admin:admin@rabbitmq:5672",
  },
  mongodb: {
    uri:
      process.env.MONGODB_URI
  },
  server: {
    port: process.env.PORT || 3000,
  },
}
