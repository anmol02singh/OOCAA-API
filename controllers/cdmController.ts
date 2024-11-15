import { Router, Request, Response, NextFunction } from 'express';
const cdmService = require('../services/cdmService');
const events = require('../config/events');

async function saveCDMData(req: Request, res: Response) {
    const { event } = req.params;
    try {
        const savedData = await cdmService.saveCDMDataToDB(event);
        res.status(201).json(savedData);
    } catch (error) {
	if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	} else {
		res.status(500).json({ message: "Unknown Error" });
	}
    }
};

async function getAllCDMData(req: Request, res: Response) {
    try {
        const data = await cdmService.fetchAllCDMData();
        if (!data) {
            return res.status(404).json({ message: 'CDM data not found' });
        }
        res.json(data);
    } catch (error) {
	if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	} else {
		res.status(500).json({ message: "Unknown Error" });
	}
    }
};

async function getCDMDataById(req: Request, res: Response) {
    try {
        const data = await cdmService.fetchCDMDataById(req.params.id);
        if (!data) {
            return res.status(404).json({ message: 'CDM data not found' });
        }
        res.json(data);
    } catch (error) {
	if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	} else {
		res.status(500).json({ message: "Unknown Error" });
	}
    }
};

async function getEvents(req: Request, res: Response) { //save events to db?? no
    try {
        res.json(events);
    } catch (error) {
	if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	} else {
		res.status(500).json({ message: "Unknown Error" });
	}
    }
};

async function getCDMDataByEvent(req: Request, res: Response) {
    const { event } = req.params;
    try {
        if (!event) {
            return res.status(400).json({ message: 'Event parameter missing' });
        }
        const data = await cdmService.fetchCDMDataByEvent(event);
        res.json(data);
    } catch (error) {
	if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	} else {
		res.status(500).json({ message: "Unknown Error" });
	}
    }
};

module.exports = {
    getAllCDMData,
    getCDMDataById,
    saveCDMData,
    getEvents,
    getCDMDataByEvent
};
