import express from 'express';
import { getAllCDMData, getCDMDataById, saveCDMData, getCDMsByEvent } from '../controllers/cdmController';
import { searchEvents } from '../controllers/searchController';
import { fetchTLEs } from '../controllers/tleController';
import { subscribeToEvent, fetchUserWatchlist, deleteEvent } from '../controllers/watchlistController';

const router = express.Router();

router.get('/', getAllCDMData);
router.get('/:id', getCDMDataById);
router.post('/sync-cdms', saveCDMData);
router.post('/search', searchEvents);
router.post('/fetchTLEs', fetchTLEs);
router.get('/by-event/:eventId', getCDMsByEvent);
router.delete('/delete-event/:eventId', deleteEvent);
router.post('/subscribe', subscribeToEvent);
//change to subsrcibe to criteria
router.get('/watchlist/:userId', fetchUserWatchlist);

export default router;
