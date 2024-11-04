require('dotenv').config();

const express = require('express');
const app = express();
const connectToDatabase = require('./config/database');
const routes = require('./routes/routes');

connectToDatabase();

app.use(express.json());

app.use('/cdm-data', routes);

app.listen(3000, () => console.log('Server Started'));