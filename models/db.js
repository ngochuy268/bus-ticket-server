const connection = require('../config/dbConfig');

connection.getConnection(error => {
  if (error) {
    console.error('Error connecting to database:', error);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = connection;