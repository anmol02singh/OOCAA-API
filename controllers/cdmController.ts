import { Router, Request, Response, NextFunction } from 'express';
import { fetchAllCDMData, fetchCDMDataById, fetchCDMDataFromDrive, saveCDMDataToDB, fetchCDMDataByEvent} from '../services/cdmService';
import events from '../config/events';
import mongoose from 'mongoose';

export async function saveCDMData(req: Request, res: Response) {
    const { event } = req.params;
    try {
        const savedData = await saveCDMDataToDB(event);
        res.status(201).json(savedData);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Unknown Error" });
        }
    }
}

export async function getAllCDMData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = await fetchAllCDMData();
        if (!data) {
            res.status(404).json({ message: 'CDM data not found' });
            return;
        }
        res.json(data);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Unknown Error" });
        }
    }
}

export async function getCDMDataById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const data = await fetchCDMDataById(id);
        if (!data) {
            res.status(404).json({ message: 'CDM data not found' });
            return;
        }
        res.json(data);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Unknown Error" });
        }
    }
}

export async function getEvents(req: Request, res: Response) {
    try {
        res.json(events);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Unknown Error" });
        }
    }
}

export async function getCDMDataByEvent(req: Request<{ event: string }>, res: Response, next: NextFunction): Promise<void> {
    const { event } = req.params;
    try {
        if (!event) {
            res.status(400).json({ message: 'Event parameter missing' });
            return;
        }
        const data = await fetchCDMDataByEvent(event);
        res.json(data);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Unknown Error" });
        }
    }
}
