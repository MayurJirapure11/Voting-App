const express = require("express");
const app = express();
const db = require("./db");
require('dotenv').config()

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const userRoutes = require('./routes/userRoutes.js')
app.use('/user',userRoutes)

const candidateRoutes = require('./routes/candidateRoutes.js')
app.use('/candidate',candidateRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("Server is listening on port 3000");
});