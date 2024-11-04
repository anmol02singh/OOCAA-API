const CDM = require('../models/cdm');

async function getAllCDMData() {
    return await CDM.find();
};

async function getCDMDataById(id) {
    return await CDM.findById(id);
};

async function saveCDMData(data) {
    const cdmData = new CDM(data);
    return await cdmData.save();
};

async function getCDMDataByEvent(event) {
    return await CDM.find({ event: event });
}

module.exports = {
    getAllCDMData,
    getCDMDataById,
    saveCDMData,
    getCDMDataByEvent
};