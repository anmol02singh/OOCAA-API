import Event from '../models/event';

export const findEvents = async (query: any) => {
  try {
    return await Event.find(query);
  } catch (error) {
    console.error('Error querying Events:', error);
    throw error;
  }
};

export async function getAllEventsFromDB() {
  try {
    return await Event.find();
  } catch (error) {
    console.error("Error in repository (getAllEventsFromDB):", error);
    throw error;
  }
};