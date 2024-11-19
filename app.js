const express = require('express');
const app = express();
const dotenv = require("dotenv").config();
const mongoose = require('mongoose');

const port = process.env.PORT;

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/mydb',)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});



