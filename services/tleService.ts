import { findTLEByDesignator, saveTLE } from '../repositories/tleRepository';
import { fetchTLEFromSpaceTrack, loginToSpaceTrack } from './spaceTrackService';

export const getTLEsForCDM = async (objectDesignators: string[], tca: string) => {
    await loginToSpaceTrack();

    const tcaDate = new Date(tca);
    const tlePromises = objectDesignators.map(async (designator) => {
    
    const existingTLE = await findTLEByDesignator(designator, tcaDate);

    if (existingTLE) {
      return existingTLE;
    }

    const tle = await fetchTLEFromSpaceTrack(designator, tcaDate);

    if (tle) {
      await saveTLE(tle);
      return tle;
    }

    throw new Error(`TLE not found for NORAD ID: ${designator}`);
  });

  return Promise.all(tlePromises);
};