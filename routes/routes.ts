import express from 'express';
const router = express.Router();
import { getAllCDMData, getCDMDataById, saveCDMData } from '../controllers/cdmController';
import { searchCDMs } from '../controllers/searchController';
import { fetchTLEs } from '../controllers/tleController';

router.get('/', getAllCDMData);
router.get('/:id', getCDMDataById);
router.post('/sync-cdms', saveCDMData);
router.post('/search', searchCDMs);
router.post('/fetchTLEs', fetchTLEs);

export default router;
