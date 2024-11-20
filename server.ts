import 'dotenv/config';
import express from 'express';
import connectToDatabase from './config/database';
import routes from './routes/routes';
import cors from 'cors';

const app = express();

connectToDatabase();

app.use(express.json());

app.use(cors());

app.use('/cdm-data', routes);

app.listen(3000, () => console.log('Server Started'));
