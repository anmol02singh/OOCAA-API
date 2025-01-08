import { SearchParams, TcaRange } from '../config/types'; 
import { findCDMs } from '../repositories/searchRepository';

export const getCDMs = async (searchParams: SearchParams[], tcaRange: TcaRange) => {
  const [tcaStart, tcaEnd] = tcaRange;

  const tcaStartDate = new Date(parseInt(tcaStart));
  const tcaEndDate = new Date(parseInt(tcaEnd));

  const queries = searchParams.map(({ criteria, value }: SearchParams) => ({
    $or: [
      { [`object1.${criteria}`]: { $regex: value, $options: 'i' } },
      { [`object2.${criteria}`]: { $regex: value, $options: 'i' } },
    ],
  }));

  const query = {
    $and: [
      ...queries,
      { tca: { $gte: tcaStartDate, $lte: tcaEndDate } },
    ],
  };

  return await findCDMs(query);
};
