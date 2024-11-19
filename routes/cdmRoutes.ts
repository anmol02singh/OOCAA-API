const express = require('express');
const router = express.Router();
const cdmController = require('../controllers/cdmController');

router.get('/', cdmController.getAllCDMData);
router.get('/:id', cdmController.getCDMDataById);
router.post('/save/:event', cdmController.saveCDMData);
router.get('/get/:event', cdmController.getCDMDataByEvent); 
router.get('/events', cdmController.getEvents);

module.exports = router
