import { Types } from 'mongoose';
import { getAllCDMData, getCDMDataById, saveCDMData, getOrCreateEvent, getCDMsForEvent, getCDMCounts } from '../repositories/cdmRepository';
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
    keyFile: './config/service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth});

async function listFilesRecursively(folderId: string): Promise<any[]> {
    const allFiles: any[] = [];

    async function fetchFiles(folderId: string, pageToken?: string) {
        try {
            const response = await drive.files.list({
                q: `'${folderId}' in parents`,
                fields: 'nextPageToken, files(id, name, mimeType)',
                pageSize: 100,
                pageToken,
            });

            const files = response.data.files || [];
            for (const file of files) {
                if (file.id && file.mimeType === 'application/vnd.google-apps.folder') {
                    console.log(`Traversing folder: ${file.name}`);
                    await fetchFiles(file.id);
                } else {
                    console.log(`Adding file: ${file.name}`);
                    allFiles.push(file);
                }
            }

            if (response.data.nextPageToken) {
                await fetchFiles(folderId, response.data.nextPageToken);
            }
        } catch (error) {
            console.error(`Error fetching files from folder ${folderId}:`, error);
            throw new Error('Unable to fetch files from Google Drive');
        }
    }

    await fetchFiles(folderId);
    return allFiles;
}

async function downloadFile(fileId: string, mimeType?: string): Promise<any> {
    try {
        if (mimeType && mimeType.startsWith('application/vnd.google-apps.')) {
            let exportMimeType: string;

            if (mimeType === 'application/vnd.google-apps.spreadsheet') {
                exportMimeType = 'text/csv';
            } else if (mimeType === 'application/vnd.google-apps.document') {
                exportMimeType = 'text/plain';
            } else {
                throw new Error(`Unsupported Google Workspace file type: ${mimeType}`);
            }

            const response = await drive.files.export(
                { fileId, mimeType: exportMimeType },
                { responseType: 'stream' }
            );

            const chunks: Buffer[] = [];
            response.data.on('data', (chunk) => chunks.push(chunk));
            return new Promise((resolve, reject) => {
                response.data.on('end', () => {
                    const fileContent = Buffer.concat(chunks).toString();
                    resolve(fileContent);
                });
                response.data.on('error', (err) => reject(err));
            });
        } else {
            const response = await drive.files.get(
                { fileId, alt: 'media' },
                { responseType: 'json' }
            );

            let data = response.data;
            if (Array.isArray(data)) {
                data = data[0];
            }

            return data;
        }
    } catch (error) {
        console.error(`Error downloading file ${fileId}:`, error);
        throw error;
    }
}

function parseNumber(value: string): number | null {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
}

function parseDate(value: string): Date | null {
    if (!value || value.trim() === '') return null;
    const date = new Date(value.endsWith('Z') ? value : `${value}Z`);
    return isNaN(date.getTime()) ? null : date;
}

async function saveCDMDataToDB(folderId: string) {
    try {
        const files = await listFilesRecursively(folderId);
        console.log(`Found ${files.length} files in the folder structure`);

        const batchSize = 1000; 
        const allData: any[] = [];

        for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);
            const batchData = await Promise.all(
                batch.map(async (file) => {
                    const data = await downloadFile(file.id, file.mimeType);
                    const newData = {
                        event: null as Types.ObjectId | null,
                        constellation: data.CONSTELLATION,
                        cdmId: data.CDM_ID,
                        filename: data.FILENAME,
                        insertEpoch: parseDate(data.INSERT_EPOCH),
                        ccsdsCdmVers: data.CCSDS_CDM_VERS,
                        comment: data.COMMENT,
                        creationDate: parseDate(data.CREATION_DATE),
                        originator: data.ORIGINATOR,
                        messageFor: data.MESSAGE_FOR,
                        messageId: data.MESSAGE_ID,
                        commentEmergencyReportable: data.COMMENT_EMERGENCY_REPORTABLE,
                        tca: parseDate(data.TCA),
                        missDistance: parseNumber(data.MISS_DISTANCE),
                        missDistanceUnit: data.MISS_DISTANCE_UNIT,
                        relativeSpeed: parseNumber(data.RELATIVE_SPEED),
                        relativeSpeedUnit: data.RELATIVE_SPEED_UNIT,
                        relativePosition: {
                            r: parseNumber(data.RELATIVE_POSITION_R),
                            t: parseNumber(data.RELATIVE_POSITION_T),
                            n: parseNumber(data.RELATIVE_POSITION_N),
                            rUnit: data.RELATIVE_POSITION_R_UNIT,
                            tUnit: data.RELATIVE_POSITION_T_UNIT,
                            nUnit: data.RELATIVE_POSITION_N_UNIT
                        },
                        relativeVelocity: {
                            r: parseNumber(data.RELATIVE_VELOCITY_R),
                            t: parseNumber(data.RELATIVE_VELOCITY_T),
                            n: parseNumber(data.RELATIVE_VELOCITY_N),
                            rUnit: data.RELATIVE_VELOCITY_R_UNIT,
                            tUnit: data.RELATIVE_VELOCITY_T_UNIT,
                            nUnit: data.RELATIVE_VELOCITY_N_UNIT
                        },
                        startScreenPeriod: parseDate(data.START_SCREEN_PERIOD),
                        stopScreenPeriod: parseDate(data.STOP_SCREEN_PERIOD),
                        screenVolumeFrame: data.SCREEN_VOLUME_FRAME,
                        screenVolumeShape: data.SCREEN_VOLUME_SHAPE,
                        screenVolume: {
                            x: parseNumber(data.SCREEN_VOLUME_X),
                            y: parseNumber(data.SCREEN_VOLUME_Y),
                            z: parseNumber(data.SCREEN_VOLUME_Z)
                        },
                        screenEntryTime: parseDate(data.SCREEN_ENTRY_TIME),
                        screenExitTime: parseDate(data.SCREEN_EXIT_TIME),
                        commentScreeningOption: data.COMMENT_SCREENING_OPTION,
                        collisionProbability: parseNumber(data.COLLISION_PROBABILITY),
                        collisionProbabilityMethod: data.COLLISION_PROBABILITY_METHOD,
                        commentEffectiveHBR: data.COMMENT_EFFECTIVE_HBR,
                        gid: data.GID,
                        object1: {
                            comment: data.SAT1_COMMENT,
                            object: data.SAT1_OBJECT,
                            objectDesignator: data.SAT1_OBJECT_DESIGNATOR,
                            catalogName: data.SAT1_CATALOG_NAME,
                            objectName: data.SAT1_OBJECT_NAME, 
                            internationalDesignator: data.SAT1_INTERNATIONAL_DESIGNATOR,
                            objectType: data.SAT1_OBJECT_TYPE,
                            operatorOrganization: data.SAT1_OPERATOR_ORGANIZATION,
                            operatorContactPosition: data.SAT1_OPERATOR_CONTACT_POSITION,
                            operatorPhone: data.SAT1_OPERATOR_PHONE,
                            operatorEmail: data.SAT1_OPERATOR_EMAIL,
                            ephemerisName: data.SAT1_EPHEMERIS_NAME,
                            covarianceMethod: data.SAT1_COVARIANCE_METHOD,
                            maneuverable: data.SAT1_MANEUVERABLE,
                            referenceFrame: data.SAT1_REFERENCE_FRAME,
                            gravityModel: data.SAT1_GRAVITY_MODEL,
                            atmosphericModel: data.SAT1_ATMOSPHERIC_MODEL,
                            nBodyPerturbations: data.SAT1_N_BODY_PERTURBATIONS,
                            solarRadPressure: data.SAT1_SOLAR_RAD_PRESSURE,
                            earthTides: data.SAT1_EARTH_TIDES,
                            inTrackThrust: data.SAT1_IN_TRACK_THRUST,
                            commentCovarianceScaleFactor: data.SAT1_COMMENT_COVARIANCE_SCALE_FACTOR,
                            commentExclusionVolumeRadius: data.SAT1_COMMENT_EXCLUSION_VOLUME_RADIUS,
                            commentApogee: data.SAT1_COMMENT_APOGEE,
                            commentPerigee: data.SAT1_COMMENT_PERIGEE,
                            commentInclination: data.SAT1_COMMENT_INCLINATION,
                            commentOperatorHardBodyRadius: data.SAT1_COMMENT_OPERATOR_HARD_BODY_RADIUS,
                            commentScreeningDataSource: data.SAT1_COMMENT_SCREENING_DATA_SOURCE,
                            timeLastobStart: parseDate(data.SAT1_TIME_LASTOB_START),
                            timeLastobEnd: parseDate(data.SAT1_TIME_LASTOB_END),
                            recommendedOdSpan: parseNumber(data.SAT1_RECOMMENDED_OD_SPAN),
                            recommendedOdSpanUnit: data.SAT1_RECOMMENDED_OD_SPAN_UNIT,
                            actualOdSpan: parseNumber(data.SAT1_ACTUAL_OD_SPAN),
                            actualOdSpanUnit: data.SAT1_ACTUAL_OD_SPAN_UNIT,
                            obsAvailable: parseNumber(data.SAT1_OBS_AVAILABLE),
                            obsUsed: parseNumber(data.SAT1_OBS_USED),
                            tracksAvailable: parseNumber(data.SAT1_TRACKS_AVAILABLE),
                            tracksUsed: parseNumber(data.SAT1_TRACKS_USED),
                            residualsAccepted: parseNumber(data.SAT1_RESIDUALS_ACCEPTED),
                            residualsAcceptedUnit: data.SAT1_RESIDUALS_ACCEPTED_UNIT,
                            weightedRms: parseNumber(data.SAT1_WEIGHTED_RMS),
                            areaPC: parseNumber(data.SAT1_AREA_PC),
                            areaPCUnit: data.SAT1_AREA_PC_UNIT,
                            areaDRG: parseNumber(data.SAT1_AREA_DRG),
                            areaSRP: parseNumber(data.SAT1_AREA_SRP),
                            mass: parseNumber(data.SAT1_MASS),
                            cdAreaOverMass: parseNumber(data.SAT1_CD_AREA_OVER_MASS),
                            cdAreaOverMassUnit: data.SAT1_CD_AREA_OVER_MASS_UNIT,
                            crAreaOverMass: parseNumber(data.SAT1_CR_AREA_OVER_MASS),
                            crAreaOverMassUnit: data.SAT1_CR_AREA_OVER_MASS_UNIT,
                            thrustAcceleration: parseNumber(data.SAT1_THRUST_ACCELERATION),
                            thrustAccelerationUnit: data.SAT1_THRUST_ACCELERATION_UNIT,
                            sedr: parseNumber(data.SAT1_SEDR),
                            sedrUnit: data.SAT1_SEDR_UNIT,
                            position: {
                                x: parseNumber(data.SAT1_X),
                                y: parseNumber(data.SAT1_Y),
                                z: parseNumber(data.SAT1_Z)
                            },
                            velocity: {
                                x_dot: parseNumber(data.SAT1_X_DOT),
                                y_dot: parseNumber(data.SAT1_Y_DOT),
                                z_dot: parseNumber(data.SAT1_Z_DOT)
                            },
                            commentDcpDensityForecastUncertainty: data.SAT1_COMMENT_DCP_DENSITY_FORECAST_UNCERTAINTY,
                            commentDcpSensitivityVectorPosition: data.SAT1_COMMENT_DCP_SENSITIVITY_VECTOR_POSITION,
                            commentDcpSensitivityVectorVelocity: data.SAT1_COMMENT_DCP_SENSITIVITY_VECTOR_VELOCITY,
                            positionCovariance: {
                                cr_r: parseNumber(data.SAT1_CR_R),
                                ct_r: parseNumber(data.SAT1_CT_R),
                                ct_t: parseNumber(data.SAT1_CT_T),
                                cn_r: parseNumber(data.SAT1_CN_R),
                                cn_t: parseNumber(data.SAT1_CN_T),
                                cn_n: parseNumber(data.SAT1_CN_N)
                            },
                            velocityCovariance: {
                                crdot_r: parseNumber(data.SAT1_CRDOT_R),
                                crdot_t: parseNumber(data.SAT1_CRDOT_T),
                                crdot_n: parseNumber(data.SAT1_CRDOT_N),
                                crdot_rdot: parseNumber(data.SAT1_CRDOT_RDOT),
                                ctdot_r: parseNumber(data.SAT1_CTDOT_R),
                                ctdot_t: parseNumber(data.SAT1_CTDOT_T),
                                ctdot_n: parseNumber(data.SAT1_CTDOT_N),
                                ctdot_rdot: parseNumber(data.SAT1_CTDOT_RDOT),
                                ctdot_tdot: parseNumber(data.SAT1_CTDOT_TDOT),
                                cndot_r: parseNumber(data.SAT1_CNDOT_R),
                                cndot_t: parseNumber(data.SAT1_CNDOT_T),
                                cndot_n: parseNumber(data.SAT1_CNDOT_N),
                                cndot_rdot: parseNumber(data.SAT1_CNDOT_RDOT),
                                cndot_tdot: parseNumber(data.SAT1_CNDOT_TDOT),
                                cndot_ndot: parseNumber(data.SAT1_CNDOT_NDOT)
                            },
                            dragCovariance: {
                                cdrg_r: parseNumber(data.SAT1_CDRG_R),
                                cdrg_t: parseNumber(data.SAT1_CDRG_T),
                                cdrg_n: parseNumber(data.SAT1_CDRG_N),
                                cdrg_rdot: parseNumber(data.SAT1_CDRG_RDOT),
                                cdrg_tdot: parseNumber(data.SAT1_CDRG_TDOT),
                                cdrg_ndot: parseNumber(data.SAT1_CDRG_NDOT),
                                cdrg_drg: parseNumber(data.SAT1_CDRG_DRG),
                            },
                            srpCovariance: {
                                csrp_r: parseNumber(data.SAT1_CSRP_R),
                                csrp_t: parseNumber(data.SAT1_CSRP_T),
                                csrp_n: parseNumber(data.SAT1_CSRP_N),
                                csrp_rdot: parseNumber(data.SAT1_CSRP_RDOT),
                                csrp_tdot: parseNumber(data.SAT1_CSRP_TDOT),
                                csrp_ndot: parseNumber(data.SAT1_CSRP_NDOT),
                                csrp_srp: parseNumber(data.SAT1_CSRP_SRP)
                            },
                            thrCovariance: {
                                cthr_r: parseNumber(data.SAT1_CTHR_R),
                                cthr_t: parseNumber(data.SAT1_CTHR_T),
                                cthr_n: parseNumber(data.SAT1_CTHR_N),
                                cthr_rdot: parseNumber(data.SAT1_CTHR_RDOT),
                                cthr_tdot: parseNumber(data.SAT1_CTHR_TDOT),
                                cthr_ndot: parseNumber(data.SAT1_CTHR_NDOT),
                                cthr_drg: parseNumber(data.SAT1_CTHR_DRG),
                                cthr_srp: parseNumber(data.SAT1_CTHR_SRP),
                                cthr_thr: parseNumber(data.SAT1_CTHR_THR),
                            },
                        },
                        object2: {
                            comment: data.SAT2_COMMENT,
                            object: data.SAT2_OBJECT,
                            objectDesignator: data.SAT2_OBJECT_DESIGNATOR,
                            catalogName: data.SAT2_CATALOG_NAME,
                            objectName: data.SAT2_OBJECT_NAME, 
                            internationalDesignator: data.SAT2_INTERNATIONAL_DESIGNATOR,
                            objectType: data.SAT2_OBJECT_TYPE,
                            operatorOrganization: data.SAT2_OPERATOR_ORGANIZATION,
                            operatorContactPosition: data.SAT2_OPERATOR_CONTACT_POSITION,
                            operatorPhone: data.SAT2_OPERATOR_PHONE,
                            operatorEmail: data.SAT2_OPERATOR_EMAIL,
                            ephemerisName: data.SAT2_EPHEMERIS_NAME,
                            covarianceMethod: data.SAT2_COVARIANCE_METHOD,
                            maneuverable: data.SAT2_MANEUVERABLE,
                            referenceFrame: data.SAT2_REFERENCE_FRAME,
                            gravityModel: data.SAT2_GRAVITY_MODEL,
                            atmosphericModel: data.SAT2_ATMOSPHERIC_MODEL,
                            nBodyPerturbations: data.SAT2_N_BODY_PERTURBATIONS,
                            solarRadPressure: data.SAT2_SOLAR_RAD_PRESSURE,
                            earthTides: data.SAT2_EARTH_TIDES,
                            inTrackThrust: data.SAT2_IN_TRACK_THRUST,
                            commentCovarianceScaleFactor: data.SAT2_COMMENT_COVARIANCE_SCALE_FACTOR,
                            commentExclusionVolumeRadius: data.SAT2_COMMENT_EXCLUSION_VOLUME_RADIUS,
                            commentApogee: data.SAT2_COMMENT_APOGEE,
                            commentPerigee: data.SAT2_COMMENT_PERIGEE,
                            commentInclination: data.SAT2_COMMENT_INCLINATION,
                            commentOperatorHardBodyRadius: data.SAT2_COMMENT_OPERATOR_HARD_BODY_RADIUS,
                            commentScreeningDataSource: data.SAT2_COMMENT_SCREENING_DATA_SOURCE,
                            timeLastobStart: parseDate(data.SAT2_TIME_LASTOB_START),
                            timeLastobEnd: parseDate(data.SAT2_TIME_LASTOB_END),
                            recommendedOdSpan: parseNumber(data.SAT2_RECOMMENDED_OD_SPAN),
                            recommendedOdSpanUnit: data.SAT2_RECOMMENDED_OD_SPAN_UNIT,
                            actualOdSpan: parseNumber(data.SAT2_ACTUAL_OD_SPAN),
                            actualOdSpanUnit: data.SAT2_ACTUAL_OD_SPAN_UNIT,
                            obsAvailable: parseNumber(data.SAT2_OBS_AVAILABLE),
                            obsUsed: parseNumber(data.SAT2_OBS_USED),
                            tracksAvailable: parseNumber(data.SAT2_TRACKS_AVAILABLE),
                            tracksUsed: parseNumber(data.SAT2_TRACKS_USED),
                            residualsAccepted: parseNumber(data.SAT2_RESIDUALS_ACCEPTED),
                            residualsAcceptedUnit: data.SAT2_RESIDUALS_ACCEPTED_UNIT,
                            weightedRms: parseNumber(data.SAT2_WEIGHTED_RMS),
                            areaPC: parseNumber(data.SAT2_AREA_PC),
                            areaPCUnit: data.SAT2_AREA_PC_UNIT,
                            areaDRG: parseNumber(data.SAT2_AREA_DRG),
                            areaSRP: parseNumber(data.SAT2_AREA_SRP),
                            mass: parseNumber(data.SAT2_MASS),
                            cdAreaOverMass: parseNumber(data.SAT2_CD_AREA_OVER_MASS),
                            cdAreaOverMassUnit: data.SAT2_CD_AREA_OVER_MASS_UNIT,
                            crAreaOverMass: parseNumber(data.SAT2_CR_AREA_OVER_MASS),
                            crAreaOverMassUnit: data.SAT2_CR_AREA_OVER_MASS_UNIT,
                            thrustAcceleration: parseNumber(data.SAT2_THRUST_ACCELERATION),
                            thrustAccelerationUnit: data.SAT2_THRUST_ACCELERATION_UNIT,
                            sedr: parseNumber(data.SAT2_SEDR),
                            sedrUnit: data.SAT2_SEDR_UNIT,
                            position: {
                                x: parseNumber(data.SAT2_X),
                                y: parseNumber(data.SAT2_Y),
                                z: parseNumber(data.SAT2_Z)
                            },
                            velocity: {
                                x_dot: parseNumber(data.SAT2_X_DOT),
                                y_dot: parseNumber(data.SAT2_Y_DOT),
                                z_dot: parseNumber(data.SAT2_Z_DOT)
                            },
                            commentDcpDensityForecastUncertainty: data.SAT2_COMMENT_DCP_DENSITY_FORECAST_UNCERTAINTY,
                            commentDcpSensitivityVectorPosition: data.SAT2_COMMENT_DCP_SENSITIVITY_VECTOR_POSITION,
                            commentDcpSensitivityVectorVelocity: data.SAT2_COMMENT_DCP_SENSITIVITY_VECTOR_VELOCITY,
                            positionCovariance: {
                                cr_r: parseNumber(data.SAT2_CR_R),
                                ct_r: parseNumber(data.SAT2_CT_R),
                                ct_t: parseNumber(data.SAT2_CT_T),
                                cn_r: parseNumber(data.SAT2_CN_R),
                                cn_t: parseNumber(data.SAT2_CN_T),
                                cn_n: parseNumber(data.SAT2_CN_N)
                            },
                            velocityCovariance: {
                                crdot_r: parseNumber(data.SAT2_CRDOT_R),
                                crdot_t: parseNumber(data.SAT2_CRDOT_T),
                                crdot_n: parseNumber(data.SAT2_CRDOT_N),
                                crdot_rdot: parseNumber(data.SAT2_CRDOT_RDOT),
                                ctdot_r: parseNumber(data.SAT2_CTDOT_R),
                                ctdot_t: parseNumber(data.SAT2_CTDOT_T),
                                ctdot_n: parseNumber(data.SAT2_CTDOT_N),
                                ctdot_rdot: parseNumber(data.SAT2_CTDOT_RDOT),
                                ctdot_tdot: parseNumber(data.SAT2_CTDOT_TDOT),
                                cndot_r: parseNumber(data.SAT2_CNDOT_R),
                                cndot_t: parseNumber(data.SAT2_CNDOT_T),
                                cndot_n: parseNumber(data.SAT2_CNDOT_N),
                                cndot_rdot: parseNumber(data.SAT2_CNDOT_RDOT),
                                cndot_tdot: parseNumber(data.SAT2_CNDOT_TDOT),
                                cndot_ndot: parseNumber(data.SAT2_CNDOT_NDOT)
                            },
                            dragCovariance: {
                                cdrg_r: parseNumber(data.SAT2_CDRG_R),
                                cdrg_t: parseNumber(data.SAT2_CDRG_T),
                                cdrg_n: parseNumber(data.SAT2_CDRG_N),
                                cdrg_rdot: parseNumber(data.SAT2_CDRG_RDOT),
                                cdrg_tdot: parseNumber(data.SAT2_CDRG_TDOT),
                                cdrg_ndot: parseNumber(data.SAT2_CDRG_NDOT),
                                cdrg_drg: parseNumber(data.SAT2_CDRG_DRG),
                            },
                            srpCovariance: {
                                csrp_r: parseNumber(data.SAT2_CSRP_R),
                                csrp_t: parseNumber(data.SAT2_CSRP_T),
                                csrp_n: parseNumber(data.SAT2_CSRP_N),
                                csrp_rdot: parseNumber(data.SAT2_CSRP_RDOT),
                                csrp_tdot: parseNumber(data.SAT2_CSRP_TDOT),
                                csrp_ndot: parseNumber(data.SAT2_CSRP_NDOT),
                                csrp_srp: parseNumber(data.SAT2_CSRP_SRP)
                            },
                            thrCovariance: {
                                cthr_r: parseNumber(data.SAT2_CTHR_R),
                                cthr_t: parseNumber(data.SAT2_CTHR_T),
                                cthr_n: parseNumber(data.SAT2_CTHR_N),
                                cthr_rdot: parseNumber(data.SAT2_CTHR_RDOT),
                                cthr_tdot: parseNumber(data.SAT2_CTHR_TDOT),
                                cthr_ndot: parseNumber(data.SAT2_CTHR_NDOT),
                                cthr_drg: parseNumber(data.SAT2_CTHR_DRG),
                                cthr_srp: parseNumber(data.SAT2_CTHR_SRP),
                                cthr_thr: parseNumber(data.SAT2_CTHR_THR),
                            },
                        },
                    };
                    if (newData.tca && newData.object1.objectDesignator && newData.object2.objectDesignator) {
                        const event = await getOrCreateEvent(newData);
                        newData.event = event._id;
                    } else {
                        console.warn('Skipping file due to missing required fields:', {
                            object1: newData.object1,
                            object2: newData.object2,
                            tca: newData.tca,
                        });
                    }
                    return newData;
                })
            );

            const insertedDocs = await saveCDMData(batchData);
            if (Array.isArray(insertedDocs)) {
                allData.push(...insertedDocs);
            } else {
                allData.push(insertedDocs);
            }
            console.log(`Processed batch ${Math.floor(i / batchSize) + 1}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('All files saved successfully');
        return allData;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error saving CDM data to database:', error.message);
        }
        throw new Error('Unable to save CDM data');
    }
}

async function fetchAllCDMData() {
    return await getAllCDMData();
};

async function fetchCDMDataById(id: Types.ObjectId) {
    return await getCDMDataById(id);
};

async function fetchCDMsByEvent(eventId: string) {
    return await getCDMsForEvent(eventId);
};
async function fetchCounts() {
    return await getCDMCounts();
}

export {
    fetchAllCDMData,
    fetchCDMDataById,
    saveCDMDataToDB,
    fetchCDMsByEvent,
    fetchCounts,
};
