import Event from '../models/event';

export const findEvents = async (query: any) => {
  try {
    return await Event.find(query);
  } catch (error) {
    console.error('Error querying Events:', error);
    throw error;
  }
};
  