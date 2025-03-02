import { Request, Response } from 'express';
import { getEvents } from '../services/searchService';
import { SearchParams, TcaRange } from '../config/types';

export const searchEvents = async (req: Request, res: Response): Promise<void> => {
  const searchParams: SearchParams[] = req.body.searchParams;
  const tcaRange: TcaRange = req.body.tcaRange;

  if (!searchParams[0].value || searchParams.length === 0) {
    res.status(400).json({ message: 'Search parameters are required' });
    return;
  }
  if (!tcaRange || tcaRange.length !== 2) {
    res.status(400).json({ message: 'TCA range is required' });
    return;
  }

  try {
    const results = await getEvents(searchParams, tcaRange);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching CDMs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};