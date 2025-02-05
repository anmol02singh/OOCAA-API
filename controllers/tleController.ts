import { Request, Response } from 'express';
import { getTLEsForCDM } from '../services/tleService';

export const fetchTLEs = async (req: Request, res: Response): Promise<void> => {
    const { objectDesignators, tca } = req.body;
  
    if (!objectDesignators || !tca) {
      res.status(400).json({ error: 'Missing required parameters: objectDesignators and tca' });
      return;
    }
  
    try {
      const tles = await getTLEsForCDM(objectDesignators, tca);
      res.json(tles);
    } catch (error) {
      console.error('Error fetching TLEs:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };