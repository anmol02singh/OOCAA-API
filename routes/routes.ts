import express from 'express';
const router = express.Router();
import { getAllCDMData, getCDMDataById, saveCDMData, getCDMDataByEvent, getEvents } from '../controllers/cdmController';

router.get('/', getAllCDMData);
router.get('/:id', getCDMDataById);
router.post('/save/:event', saveCDMData);
router.get('/get/:event', getCDMDataByEvent); 
router.get('/events', getEvents);

export default router

//just post (save all cdms within )