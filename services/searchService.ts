import { SearchParams, TcaRange } from '../config/types'; 
import { findEvents } from '../repositories/searchRepository';

<<<<<<< HEAD
export const getEvents = async (searchParams: SearchParams[], tcaRange: TcaRange) => {
=======
export const getEvents = async (
  searchParams: SearchParams[], 
  tcaRange: TcaRange,
  extraFilters: {
    missDistanceValue?: number;
    missDistanceOperator?: 'lte' | 'gte' | 'eq';
    collisionProbabilityValue?: number;
    collisionProbabilityOperator?: 'lte' | 'gte' | 'eq';
    operatorOrganization?: string;
  }
) => {
>>>>>>> main
  const [tcaStart, tcaEnd] = tcaRange;

  const tcaStartDate = new Date(parseInt(tcaStart));
  const tcaEndDate = new Date(parseInt(tcaEnd));

<<<<<<< HEAD
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
=======
>>>>>>> main
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
<<<<<<< HEAD
  });  
=======
  });

  const additionalFilters = [];

  if (extraFilters.missDistanceValue != null && extraFilters.missDistanceOperator) {
    let operator;
    switch (extraFilters.missDistanceOperator) {
      case 'lte':
        operator = { $lte: extraFilters.missDistanceValue };
        break;
      case 'gte':
        operator = { $gte: extraFilters.missDistanceValue };
        break;
      case 'eq':
        operator = { $eq: extraFilters.missDistanceValue };
        break;
    }
    additionalFilters.push({ 
      missDistances: { $elemMatch: operator },
    });
  }

  if (extraFilters.collisionProbabilityValue != null && extraFilters.collisionProbabilityOperator) {
    let operator;
    switch(extraFilters.collisionProbabilityOperator) {
      case 'lte':
        operator = { $lte: extraFilters.collisionProbabilityValue };
        break;
      case 'gte':
        operator = { $gte: extraFilters.collisionProbabilityValue };
        break;
      case 'eq':
        operator = { $eq: extraFilters.collisionProbabilityValue };
        break;
    }
    additionalFilters.push({ 
      collisionProbabilities: { $elemMatch: operator },
    });
  }

  if (extraFilters.operatorOrganization) {
    additionalFilters.push({
      $or: [
        { primaryOperatorOrganization: { $regex: extraFilters.operatorOrganization, $options: 'i' } },
        { secondaryOperatorOrganization: { $regex: extraFilters.operatorOrganization, $options: 'i' } },
      ],
    });
  }
>>>>>>> main

  const query = {
    $and: [
      ...queries,
      { tca: { $gte: tcaStartDate, $lte: tcaEndDate } },
<<<<<<< HEAD
=======
      ...additionalFilters,
>>>>>>> main
    ],
  };

  return await findEvents(query);
};
