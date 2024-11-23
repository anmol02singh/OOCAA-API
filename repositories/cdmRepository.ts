import { Types } from 'mongoose';
import CDM from '../models/cdm';

async function getAllCDMData() {
    return await CDM.find();
};

async function getCDMDataById(id: Types.ObjectId) {
    return await CDM.findById(id);
};

async function saveCDMData(data: any) {
    const cdmData = new CDM(data);
    return await cdmData.save();
};

export {
    getAllCDMData,
    getCDMDataById,
    saveCDMData
};
