const cdmService = require('../services/cdmService');
const events = require('../config/events');

async function saveCDMData(req, res) {
    const { event } = req.params;
    try {
        const savedData = await cdmService.saveCDMDataToDB(event);
        res.status(201).json(savedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function getAllCDMData(req, res) {
    try {
        const data = await cdmService.fetchAllCDMData();
        if (!data) {
            return res.status(404).json({ message: 'CDM data not found' });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function getCDMDataById(req, res) {
    try {
        const data = await cdmService.fetchCDMDataById(req.params.id);
        if (!data) {
            return res.status(404).json({ message: 'CDM data not found' });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function getEvents(req, res) { //save events to db?? no
    try {
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

async function getCDMDataByEvent(req, res) {
    const { event } = req.params;
    try {
        if (!event) {
            return res.status(400).json({ message: 'Event parameter missing' });
        }
        const data = await cdmService.fetchCDMDataByEvent(event);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

module.exports = {
    getAllCDMData,
    getCDMDataById,
    saveCDMData,
    getEvents,
    getCDMDataByEvent
};