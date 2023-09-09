const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'misterwhite-demo.cgda24cx6iqh.ap-southeast-1.rds.amazonaws.com',
  user: 'admin',
  password: 'white1016890!',
  database: 'mrwhite_database',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection error: ' + err.message);
  } else {
    console.log('Connected to the database');
  }
});

const app = express();
const port = 3000;

app.use(cors());
// Define a GET endpoint for reading data from the database
app.get('/api/data', (req, res) => {
  const page = req.query.page || 1; // Get the page number from the query parameter
  const searchValue = req.query.searchValue || undefined;
  const searchColumn = req.query.searchColumn || undefined;

  const pageSize = 20; // Number of records per page
  const offset = (page - 1) * pageSize; // Calculate the offset

  let query;
  if (searchValue && searchColumn) {
    query = `SELECT * FROM WHITE_DATA WHERE ${searchColumn} LIKE '%${searchValue}%' LIMIT ${offset}, ${pageSize}`;
  } else {
    query = `SELECT * FROM WHITE_DATA LIMIT ${offset}, ${pageSize}`;
  }

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error: ' + err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/api/data/rows', (req, res) => {
  const query = `SELECT COUNT(*) as total FROM WHITE_DATA`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error: ' + err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
