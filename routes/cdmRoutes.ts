import express from "express";
import {
  getAllCDMData,
  getCDMDataById,
  saveCDMData,
  getCDMsByEvent,
  getCounts,
} from "../controllers/cdmController";
import {
  searchEvents,
  getAllEvents,
  searchLimitedEvents,
} from "../controllers/searchController";
import { fetchTLEs } from "../controllers/tleController";
import {
  subscribeToCriteria,
  fetchUserWatchlist,
  deleteFilters,
} from "../controllers/watchlistController";

const router = express.Router();

router.get("/getAllEvents", (req, res) => {
  getAllEvents(req, res);
});
router.get("/getCounts", getCounts);
router.get("/", getAllCDMData);
router.get("/:id", getCDMDataById);
router.post("/sync-cdms", saveCDMData);
router.post("/search", searchEvents);
router.post("/search-limited", searchLimitedEvents);
router.post("/fetchTLEs", fetchTLEs);
router.get("/by-event/:eventId", getCDMsByEvent);
router.delete("/delete-filters/:filterId", deleteFilters);
router.post("/subscribe", subscribeToCriteria);
router.get("/watchlist/:userId", fetchUserWatchlist);

export default router;
