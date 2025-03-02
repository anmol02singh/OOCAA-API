import Event from '../models/event';

export const findEvents = async (query: any) => {
  try {
    return await Event.find(query);
  } catch (error) {
    console.error('Error querying Events:', error);
    throw error;
  }
};
// export const findCDMs = async (query: any) => {
//     console.log('Executing query:', JSON.stringify(query, null, 2));
//     const results = await CDM.find(query);
//     console.log('Query results:', results);
//     return results;
//   };
  