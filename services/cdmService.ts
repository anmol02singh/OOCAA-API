import { Types } from 'mongoose';
import { getAllCDMData, getCDMDataById, saveCDMData, getOrCreateEvent } from '../repositories/cdmRepository';
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
                        event: null,
                        ccsdsCdmVers: data.CCSDS_CDM_VERS,
                        creationDate: parseDate(data.CREATION_DATE),
                        originator: data.ORIGINATOR,
                        messageId: data.MESSAGE_ID,
                        tca: parseDate(data.TCA),
                        missDistance: parseNumber(data.MISS_DISTANCE),
                        collisionProbability: parseNumber(data.COLLISION_PROBABILITY),
                        object1: {
                            object: data.SAT1_OBJECT,
                            objectDesignator: data.SAT1_OBJECT_DESIGNATOR,
                            catalogName: data.SAT1_CATALOG_NAME,
                            objectName: data.SAT1_OBJECT_NAME, 
                            internationalDesignator: data.SAT1_INTERNATIONAL_DESIGNATOR,
                            objectType: data.SAT1_OBJECT_TYPE,
                            operatorOrganization: data.SAT1_OPERATOR_ORGANIZATION,
                            ephemerisName: data.SAT1_EPHEMERIS_NAME,
                            covarianceMethod: data.SAT1_COVARIANCE_METHOD,
                            maneuverable: data.SAT1_MANEUVERABLE,
                            referenceFrame: data.SAT1_REFERENCE_FRAME,
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
                            }
                        },
                        object2: {
                            object: data.SAT2_OBJECT,
                            objectDesignator: data.SAT2_OBJECT_DESIGNATOR,
                            catalogName: data.SAT2_CATALOG_NAME,
                            objectName: data.SAT2_OBJECT_NAME,
                            internationalDesignator: data.SAT2_INTERNATIONAL_DESIGNATOR,
                            objectType: data.SAT2_OBJECT_TYPE,
                            operatorOrganization: data.SAT2_OPERATOR_ORGANIZATION,
                            ephemerisName: data.SAT2_EPHEMERIS_NAME,
                            covarianceMethod: data.SAT2_COVARIANCE_METHOD,
                            maneuverable: data.SAT2_MANEUVERABLE,
                            referenceFrame: data.SAT2_REFERENCE_FRAME,
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
                            }
                        }
                    };
                    if (newData.tca && newData.object1.objectDesignator && newData.object2.objectDesignator) {
                        const event = await getOrCreateEvent(newData);
                        newData.event = event._id;
                    } else {
                        console.warn('Skipping file due to missing required fields:', {
                            object1: newData.object1,
                            object2: newData.object2,
                            tca: newData.tca
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

export {
    fetchAllCDMData,
    fetchCDMDataById,
    saveCDMDataToDB
};
