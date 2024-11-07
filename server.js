require('dotenv').config();

const express = require('express');
const app = express();
const connectToDatabase = require('./config/database');
const routes = require('./routes/routes');
const cors = require('cors');

connectToDatabase();

app.use(express.json());

app.use(cors());

app.use('/cdm-data', routes);

app.listen(3000, () => console.log('Server Started'));