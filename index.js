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
const port = process.env.PORT || 9001;
let searchDataForOtherQuery;

app.use(cors());
// Define a GET endpoint for reading data from the database
app.get('/api/data', (req, res) => {
  const page = req.query.page || 1; // Get the page number from the query parameter
  let searchData = req.query.searchValue || undefined;
  searchDataForOtherQuery = searchData || undefined;

  const pageSize = 20; // Number of records per page
  const offset = (page - 1) * pageSize; // Calculate the offset

  let query;
  if (searchData) {
    searchData = JSON.parse(searchData);
    searchQuery = '';
    if (Object.keys(searchData).length === 1) {
      Object.keys(searchData).forEach((searchDataO) => {
        searchQuery =
          searchQuery + `${searchDataO} LIKE '%${searchData[searchDataO]}%'`;
      });
    } else {
      Object.keys(searchData).forEach((searchDataO, index) => {
        if (index === Object.keys(searchData).length - 1) {
          searchQuery =
            searchQuery + `${searchDataO} LIKE '%${searchData[searchDataO]}%'`;
        } else {
          searchQuery =
            searchQuery +
            `${searchDataO} LIKE '%${searchData[searchDataO]}%' AND `;
        }
      });
    }
    query = `SELECT * FROM WHITE_DATA_TABLE WHERE ${searchQuery} LIMIT ${offset}, ${pageSize}`;
  } else {
    query = `SELECT * FROM WHITE_DATA_TABLE LIMIT ${offset}, ${pageSize}`;
  }

  db.query(query, async (err, results) => {
    if (err) {
      console.error('Database query error: ' + err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json({
        data: results,
      });
    }
  });
});

app.get('/api/data/rows', (req, res) => {
  const query = `SELECT COUNT(*) as total FROM WHITE_DATA_TABLE`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error: ' + err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/api/data/rows/data', (req, res) => {
  let searchData = searchDataForOtherQuery;
  let query;
  if (searchData) {
    searchData = JSON.parse(searchData);
    searchQuery = '';
    if (Object.keys(searchData).length === 1) {
      Object.keys(searchData).forEach((searchDataO) => {
        searchQuery =
          searchQuery + `${searchDataO} LIKE '%${searchData[searchDataO]}%'`;
      });
    } else {
      Object.keys(searchData).forEach((searchDataO, index) => {
        if (index === Object.keys(searchData).length - 1) {
          searchQuery =
            searchQuery + `${searchDataO} LIKE '%${searchData[searchDataO]}%'`;
        } else {
          searchQuery =
            searchQuery +
            `${searchDataO} LIKE '%${searchData[searchDataO]}%' AND `;
        }
      });
    }
    query = `SELECT COUNT(*) as total FROM WHITE_DATA_TABLE WHERE ${searchQuery}`;
  } else {
    query = `SELECT COUNT(*) as total FROM WHITE_DATA_TABLE`;
  }

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/login/:email/:password', (req, res) => {
  const email = req.params.email;
  const password = req.params.password;
  const query = `SELECT * FROM user_db WHERE email='${email}' AND password='${password}'`;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (results.length == 0) {
        res.status(400).json({
          status: false,
        });
      } else {
        res.status(200).json({
          status: true,
        });
      }
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
