import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import * as tough from 'tough-cookie';

const SPACE_TRACK_LOGIN_URL = 'https://www.space-track.org/ajaxauth/login';
const SPACE_TRACK_API_BASE = 'https://www.space-track.org/basicspacedata/query/class/gp_history';

const cookieJar = new tough.CookieJar();
const axiosInstance = wrapper(axios.create({ jar: cookieJar }));

export const loginToSpaceTrack = async () => {
  const username = process.env.SPACE_TRACK_USERNAME;
  const password = process.env.SPACE_TRACK_PASSWORD;

  if (!username || !password) {
    throw new Error('Space-Track credentials are missing. Check your .env file.');
  }

  try {
    await axiosInstance.post(SPACE_TRACK_LOGIN_URL, {
      identity: username,
      password: password,
    });
    console.log('Successfully logged in to Space-Track.');
  } catch (error) {
    const err = error as any;
    console.error('Error logging into Space-Track:', err.response?.data || err.message);
    throw new Error('Failed to log in to Space-Track');
  }
};

export const fetchTLEFromSpaceTrack = async (designator: string, tcaDate: Date) => {
    try {
      await loginToSpaceTrack();

      const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
      const startEpoch = new Date(tcaDate);
      startEpoch.setDate(startEpoch.getDate() - 1); 
  
      const endEpoch = new Date(tcaDate);
      endEpoch.setDate(endEpoch.getDate()); 
  
      //const queryURL = `${SPACE_TRACK_API_BASE}/NORAD_CAT_ID/${designator}/EPOCH/${formatDate(startEpoch)}--${formatDate(endEpoch)}/orderby/EPOCH/format/tle`;
      //https://www.space-track.org/basicspacedata/query/class/gp_history/NORAD_CAT_ID/39088/orderby/TLE_LINE1 DESC/EPOCH/2024-11-19--2024-11-20/format/tle
      const queryURL = `${SPACE_TRACK_API_BASE}/NORAD_CAT_ID/${designator}/EPOCH/${formatDate(startEpoch)}--${formatDate(endEpoch)}/orderby/TLE_LINE1 DESC/format/tle`;
  
      const response = await axiosInstance.get(queryURL, { responseType: 'text' });

      if (response.data) {
        const tleArray = response.data.trim().split('\n');
        if (tleArray.length >= 2) {
          return {
            designator,
            tleLine1: tleArray[0],
            tleLine2: tleArray[1],
            epoch: new Date(tcaDate), // Extract epoch from the TLE data
          };
        } else {
          throw new Error('Incomplete TLE data received.');
        }
      }
      
      throw new Error(`No TLEs found for NORAD_CAT_ID: ${designator} in the specified range.`);
    } catch (error) {
      const err = error as any;
      console.error('Error fetching TLE from Space-Track:', err.response?.data || err.message);
      throw new Error('Failed to fetch TLE from Space-Track API');
    }
  };
  