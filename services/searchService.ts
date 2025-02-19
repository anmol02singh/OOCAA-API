import { SearchParams, TcaRange } from '../config/types'; 
import { findEvents } from '../repositories/searchRepository';

export const getEvents = async (searchParams: SearchParams[], tcaRange: TcaRange) => {
  const [tcaStart, tcaEnd] = tcaRange;

  const tcaStartDate = new Date(parseInt(tcaStart));
  const tcaEndDate = new Date(parseInt(tcaEnd));

  // const queries = searchParams.map(({ criteria, value }: SearchParams) => ({
  //   $or: [
  //     { [`object1.${criteria}`]: { $regex: value, $options: 'i' } },
  //     { [`object2.${criteria}`]: { $regex: value, $options: 'i' } },
  //   ],
  // }));

  // const queries = searchParams.map(({ criteria, value }: SearchParams) => {
  //   console.log("criteria", criteria);  
  //   if (criteria === 'objectDesignator') {
  //     return {
  //       $or: [
  //         { primaryObjectDesignator: { $regex: value, $options: 'i' } },
  //         { secondaryObjectDesignator: { $regex: value, $options: 'i' } },
  //       ],
  //     };
  //   } else {
  //     return { [criteria]: { $regex: value, $options: 'i' } };
  //   }
  // });
  const queries = searchParams.map(({ criteria, value }: SearchParams) => {
    switch (criteria) {
      case 'objectDesignator':
        return {
          $or: [
            { primaryObjectDesignator: { $regex: value, $options: 'i' } },
            { secondaryObjectDesignator: { $regex: value, $options: 'i' } },
          ],
        };
      case 'objectType':
        return {
          $or: [
            { primaryObjectType: { $regex: value, $options: 'i' } },
            { secondaryObjectType: { $regex: value, $options: 'i' } },
          ],
        };
      case 'objectName':
        return {
          $or: [
            { primaryObjectName: { $regex: value, $options: 'i' } },
            { secondaryObjectName: { $regex: value, $options: 'i' } },
          ],
        };
      default:
        return { [criteria]: { $regex: value, $options: 'i' } };
    }
  });  

  const query = {
    $and: [
      ...queries,
      { tca: { $gte: tcaStartDate, $lte: tcaEndDate } },
    ],
  };

  console.log('Query:', JSON.stringify(query, null, 2));

  return await findEvents(query);
};
