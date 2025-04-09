import express from 'express';
import { getAllCDMData, getCDMDataById, saveCDMData, getCDMsByEvent } from '../controllers/cdmController';
import { searchEvents, getAllEvents } from '../controllers/searchController';
import { fetchTLEs } from '../controllers/tleController';
import { subscribeToCriteria, fetchUserWatchlist, deleteEvent } from '../controllers/watchlistController';

const router = express.Router();

router.get('/getAllEvents', (req, res) => {
    getAllEvents(req, res);
  });
router.get('/', getAllCDMData);
router.get('/:id', getCDMDataById);
router.post('/sync-cdms', saveCDMData);
router.post('/search', searchEvents);
router.post('/fetchTLEs', fetchTLEs);
router.get('/by-event/:eventId', getCDMsByEvent);
router.delete('/delete-event/:eventId', deleteEvent);
router.post('/subscribe', subscribeToCriteria);
router.get('/watchlist/:userId', fetchUserWatchlist);

export default router;
