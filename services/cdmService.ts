import { Types } from 'mongoose';
import { getAllCDMData, getCDMDataById, saveCDMData, getCDMDataByEvent } from '../repositories/cdmRepository';
import axios from 'axios';
import fileIds  from '../config/fileIds';

function parseDate(dateString: string) {
    if (!dateString) {
        return null;
    }
    
    if (!dateString.endsWith("Z")) {
        dateString += "Z";
    }
    
    return new Date(dateString);
};

async function fetchCDMDataFromDrive(event: string, index: number) {
    const fileId = fileIds[event][index];
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    try {
        const response = await axios.get(url);
        const dataArray = response.data;

        const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;
        return data;
    } catch (error) {
	if (error instanceof Error) {
             console.error(`Error fetching CDM data from Google Drive for ${event}, file ${index}:`, error.message);
	}
        throw new Error('Unable to fetch data from Google Drive');
    }
};

async function saveCDMDataToDB(event: string) {
    if (!fileIds[event]) {
        console.error(`${event} does not exist`);
    }
    const dataPromises = fileIds[event].map((_: string, index: number) => fetchCDMDataFromDrive(event, index));

    try {
        const allData = await Promise.all(dataPromises);

        const savedData = await Promise.all(
            allData.map(data => {
                const newData = {
                    ccsdsCdmVers: data.CCSDS_CDM_VERS,
                    creationDate: parseDate(data.CREATION_DATE) || new Date(),
                    originator: data.ORIGINATOR,
                    messageId: data.MESSAGE_ID,
                    tca: new Date(data.TCA),
                    missDistance: parseFloat(data.MISS_DISTANCE),
                    event: event,
                    satellite1: {
                        object: data.SAT1_OBJECT,
                        objectDesignator: data.SAT1_OBJECT_DESIGNATOR,
                        catalogName: data.SAT1_CATALOG_NAME,
                        internationalDesignator: data.SAT1_INTERNATIONAL_DESIGNATOR,
                        ephemerisName: data.SAT1_EPHEMERIS_NAME,
                        covarianceMethod: data.SAT1_COVARIANCE_METHOD,
                        maneuverable: data.SAT1_MANEUVERABLE,
                        referenceFrame: data.SAT1_REFERENCE_FRAME,
                        position: {
                            x: parseFloat(data.SAT1_X),
                            y: parseFloat(data.SAT1_Y),
                            z: parseFloat(data.SAT1_Z)
                        },
                        velocity: {
                            x_dot: parseFloat(data.SAT1_X_DOT),
                            y_dot: parseFloat(data.SAT1_Y_DOT),
                            z_dot: parseFloat(data.SAT1_Z_DOT)
                        },
                        positionCovariance: {
                            cr_r: parseFloat(data.SAT1_CR_R),
                            ct_r: parseFloat(data.SAT1_CT_R),
                            ct_t: parseFloat(data.SAT1_CT_T),
                            cn_r: parseFloat(data.SAT1_CN_R),
                            cn_t: parseFloat(data.SAT1_CN_T),
                            cn_n: parseFloat(data.SAT1_CN_N)
                        },
                        velocityCovariance: {
                            crdot_r: parseFloat(data.SAT1_CRDOT_R),
                            crdot_t: parseFloat(data.SAT1_CRDOT_T),
                            crdot_n: parseFloat(data.SAT1_CRDOT_N),
                            crdot_rdot: parseFloat(data.SAT1_CRDOT_RDOT),
                            ctdot_r: parseFloat(data.SAT1_CTDOT_R),
                            ctdot_t: parseFloat(data.SAT1_CTDOT_T),
                            ctdot_n: parseFloat(data.SAT1_CTDOT_N),
                            ctdot_rdot: parseFloat(data.SAT1_CTDOT_RDOT),
                            ctdot_tdot: parseFloat(data.SAT1_CTDOT_TDOT),
                            cndot_r: parseFloat(data.SAT1_CNDOT_R),
                            cndot_t: parseFloat(data.SAT1_CNDOT_T),
                            cndot_n: parseFloat(data.SAT1_CNDOT_N),
                            cndot_rdot: parseFloat(data.SAT1_CNDOT_RDOT),
                            cndot_tdot: parseFloat(data.SAT1_CNDOT_TDOT),
                            cndot_ndot: parseFloat(data.SAT1_CNDOT_NDOT)
                        }
                    },
                    satellite2: {
                        object: data.SAT2_OBJECT,
                        objectDesignator: data.SAT2_OBJECT_DESIGNATOR,
                        catalogName: data.SAT2_CATALOG_NAME,
                        internationalDesignator: data.SAT2_INTERNATIONAL_DESIGNATOR,
                        ephemerisName: data.SAT2_EPHEMERIS_NAME,
                        covarianceMethod: data.SAT2_COVARIANCE_METHOD,
                        maneuverable: data.SAT2_MANEUVERABLE,
                        referenceFrame: data.SAT2_REFERENCE_FRAME,
                        position: {
                            x: parseFloat(data.SAT2_X),
                            y: parseFloat(data.SAT2_Y),
                            z: parseFloat(data.SAT2_Z)
                        },
                        velocity: {
                            x_dot: parseFloat(data.SAT2_X_DOT),
                            y_dot: parseFloat(data.SAT2_Y_DOT),
                            z_dot: parseFloat(data.SAT2_Z_DOT)
                        },
                        positionCovariance: {
                            cr_r: parseFloat(data.SAT2_CR_R),
                            ct_r: parseFloat(data.SAT2_CT_R),
                            ct_t: parseFloat(data.SAT2_CT_T),
                            cn_r: parseFloat(data.SAT2_CN_R),
                            cn_t: parseFloat(data.SAT2_CN_T),
                            cn_n: parseFloat(data.SAT2_CN_N)
                        },
                        velocityCovariance: {
                            crdot_r: parseFloat(data.SAT2_CRDOT_R),
                            crdot_t: parseFloat(data.SAT2_CRDOT_T),
                            crdot_n: parseFloat(data.SAT2_CRDOT_N),
                            crdot_rdot: parseFloat(data.SAT2_CRDOT_RDOT),
                            ctdot_r: parseFloat(data.SAT2_CTDOT_R),
                            ctdot_t: parseFloat(data.SAT2_CTDOT_T),
                            ctdot_n: parseFloat(data.SAT2_CTDOT_N),
                            ctdot_rdot: parseFloat(data.SAT2_CTDOT_RDOT),
                            ctdot_tdot: parseFloat(data.SAT2_CTDOT_TDOT),
                            cndot_r: parseFloat(data.SAT2_CNDOT_R),
                            cndot_t: parseFloat(data.SAT2_CNDOT_T),
                            cndot_n: parseFloat(data.SAT2_CNDOT_N),
                            cndot_rdot: parseFloat(data.SAT2_CNDOT_RDOT),
                            cndot_tdot: parseFloat(data.SAT2_CNDOT_TDOT),
                            cndot_ndot: parseFloat(data.SAT2_CNDOT_NDOT)
                        }
                    }
                };

                return saveCDMData(newData);
            })
        );
        return savedData;
    } catch (error) {
	if (error instanceof Error) {
            console.error('Error saving CDM data to database:', error.message);
	}
        throw new Error('Unable to save CDM data');
    }
};

async function fetchCDMDataByEvent(event: string) {
    return await getCDMDataByEvent(event);
};

async function fetchAllCDMData() {
    return await getAllCDMData();
};

async function fetchCDMDataById(id: Types.ObjectId) {
    return await getCDMDataById(id);
};

export {
    fetchAllCDMData,
    fetchCDMDataById,
    fetchCDMDataFromDrive,
    saveCDMDataToDB,
    fetchCDMDataByEvent
};
