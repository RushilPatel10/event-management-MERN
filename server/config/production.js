module.exports = {
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientURL: process.env.CLIENT_URL || 'http://localhost:3000',
  port: process.env.PORT || 5000
}; 