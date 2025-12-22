const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_PASSWORD',  // یہاں اپنا password لکھیں
  database: 'mywebsite'
});

db.connect(err => {
  if (err) console.log('DB Connection Error:', err);
  else console.log('Connected to MySQL Successfully!');
});

app.post('/submit', (req, res) => {
  const { name, email, message } = req.body;

  const query = "INSERT INTO submissions (name, email, message) VALUES (?, ?, ?)";

  db.query(query, [name, email, message], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error saving data");
    } else {
      res.send("Form submitted successfully!");
    }
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
