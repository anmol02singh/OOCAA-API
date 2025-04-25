import { Request, Response, NextFunction } from 'express';
import { fetchAllCDMData, fetchCDMDataById, saveCDMDataToDB, fetchCDMsByEvent, fetchCounts } from '../services/cdmService';
import mongoose from 'mongoose';

export async function saveCDMData(req: Request, res: Response) {
    const folderId = (process.env.FOLDER_ID as string);
    try {
        const savedData = await saveCDMDataToDB(folderId);
        res.status(201).json({ message: 'CDMs synced successfully', data: savedData})
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Unknown error'});
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

export async function getCDMsByEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    const eventId = req.params.eventId;
    try {
        const data = await fetchCDMsByEvent(eventId);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in controller (getCDMsByEvent):', error);
        res.status(500).json({ message: 'Error fetching CDMs for event' });
    }
}

export async function getCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = await fetchCounts();
        if (!data) {
            res.status(404).json({ message: 'Counts not found' });
            return;
        }
        res.json(data);
    } catch (error) {
        console.error('Error in controller (getCounts):', error);
        res.status(500).json({ message: 'Error fetching counts' });
    }
}

/*

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
*/