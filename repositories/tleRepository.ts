import TLEModel from '../models/tle';

export const findTLEByDesignator = async (designator: string, tca: Date) => {
  const timeWindow = 24 * 60 * 60 * 1000; // - 1 day
  return TLEModel.findOne({
    designator,
    epoch: { $gte: new Date(tca.getTime() - timeWindow), $lte: new Date(tca.getTime()) },
  });
};

export const saveTLE = async (tle: { designator: string; tleLine1: string; tleLine2: string; epoch: Date }) => {
  
    if (!tle.designator || !tle.tleLine1 || !tle.tleLine2 || !tle.epoch) {
        throw new Error('Missing required fields for TLE');
    }
  const savedTLE = new TLEModel(tle);
  return savedTLE.save();
};
