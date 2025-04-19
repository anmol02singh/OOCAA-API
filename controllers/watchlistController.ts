import { addToWatchlist, getwatchlist } from "../services/watchlistService";
import { Request, Response } from 'express';

export const subscribeToEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, eventId } = req.body;
        if (!userId || !eventId) {
            res.status(400).json({ message: 'Missing required parameters: userId and eventId' });
            return;
        }
        const data = await addToWatchlist(userId, eventId);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in controller (subscribeToEvent):', error);
        res.status(500).json({ message: 'Error subscribing to event' });
    }
};

export const fetchUserWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ message: 'Missing required parameter: userId' });
            return;
        }
        const data = await getwatchlist(userId);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in controller (fetchUserWatchlist):', error);
        res.status(500).json({ message: 'Error fetching user watchlist' });
    }
};