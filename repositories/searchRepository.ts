import CDM from '../models/cdm';

export const findCDMs = async (query: any) => {
  try {
    return await CDM.find(query);
  } catch (error) {
    console.error('Error querying CDMs:', error);
    throw error;
  }
};
// export const findCDMs = async (query: any) => {
//     console.log('Executing query:', JSON.stringify(query, null, 2));
//     const results = await CDM.find(query);
//     console.log('Query results:', results);
//     return results;
//   };
  