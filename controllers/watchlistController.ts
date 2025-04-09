import { addToWatchlist, getwatchlist, serviceDeleteEvent } from "../services/watchlistService";
import { Request, Response } from 'express';

export const subscribeToCriteria = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            userId,
            searchParams,
            tcaRange,
            missDistanceValue,
            missDistanceOperator,
            collisionProbabilityValue,
            collisionProbabilityOperator,
            operatorOrganization,
         } = req.body;
        if (!userId || !tcaRange) {
            res.status(400).json({ message: 'Missing required parameters: userId and tcaRange' });
            return;
        }
        
        try {
            const data = await addToWatchlist({ 
                user: userId, 
                searchParams,
                tcaRange,
                missDistanceValue,
                missDistanceOperator,
                collisionProbabilityValue,
                collisionProbabilityOperator,
                operatorOrganization,
            });
            res.status(200).json(data);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Duplicate subscription')) {
                res.status(409).json({ message: error.message });
            } else {
                throw error;
            }
        }
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

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { eventId } = req.params;
        if (!eventId) {
            res.status(400).json({ message: 'Missing required parameter: eventId' });
            return;
        }
        const data = await serviceDeleteEvent(eventId);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in controller (deleteEvent):', error);
        res.status(500).json({ message: 'Error deleting event from watchlist' });
    }
};