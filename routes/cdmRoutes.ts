import express from 'express';
import { getAllCDMData, getCDMDataById, saveCDMData, getCDMsByEvent } from '../controllers/cdmController';
import { searchEvents } from '../controllers/searchController';
import { fetchTLEs } from '../controllers/tleController';
import { subscribeToEvent, fetchUserWatchlist } from '../controllers/watchlistController';

const router = express.Router();

router.get('/', getAllCDMData);
router.get('/:id', getCDMDataById);
router.post('/sync-cdms', saveCDMData);
router.post('/search', searchEvents);
router.post('/fetchTLEs', fetchTLEs);
router.get('/by-event/:eventId', getCDMsByEvent);
router.post('/subscribe', subscribeToEvent);
//change to subsrcibe to object
router.get('/watchlist/:userId', fetchUserWatchlist);

export default router;
