const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see raw SQL queries
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected Successfully.');
    // Sync models (create tables if they don't exist)
    await sequelize.sync(); 
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };