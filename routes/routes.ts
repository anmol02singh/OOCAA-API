import express from 'express';
const router = express.Router();
import { getAllCDMData, getCDMDataById, saveCDMData } from '../controllers/cdmController';

router.get('/', getAllCDMData);
router.get('/:id', getCDMDataById);
router.post('/sync-cdms', saveCDMData);

export default router
