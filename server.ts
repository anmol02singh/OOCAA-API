import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import connectToDatabase from './config/database';
import cdmRoutes from './routes/cdmRoutes';
import otherRoutes from './routes/otherRoutes';

const app = express();

connectToDatabase();

app.use(express.json());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true}));

app.use('/cdm-data', cdmRoutes);
app.use('/', otherRoutes);

app.listen(3000, () => console.log('Server Started'));
