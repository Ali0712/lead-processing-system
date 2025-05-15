module.exports = {
  rabbitmq: {
    url: process.env.RABBITMQ_URL
  },
  mongodb: {
    uri:
      process.env.MONGODB_URI
  },
  server: {
    port: process.env.PORT || 3000,
  },
}
