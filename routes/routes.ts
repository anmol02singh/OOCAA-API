import express from 'express';
const router = express.Router();
import { getAllCDMData, getCDMDataById, saveCDMData, getCDMsByEvent } from '../controllers/cdmController';
import { searchEvents } from '../controllers/searchController';
import { fetchTLEs } from '../controllers/tleController';

router.get('/', getAllCDMData);
router.get('/:id', getCDMDataById);
router.post('/sync-cdms', saveCDMData);
router.post('/search', searchEvents);
router.post('/fetchTLEs', fetchTLEs);
router.get('/by-event/:eventId', getCDMsByEvent);

export default router;
