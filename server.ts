require('dotenv').config();

const express = require('express');
const app = express();
const connectToDatabase = require('./config/database');
const cdmRoutes = require('./routes/cdmRoutes');
const otherRoutes = require('./routes/otherRoutes');
const cors = require('cors');
const bodyParser = require('body-parser');

connectToDatabase();

app.use(express.json());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true}));

app.use('/cdm-data', cdmRoutes);
app.use('/', otherRoutes);

app.listen(3000, () => console.log('Server Started'));
