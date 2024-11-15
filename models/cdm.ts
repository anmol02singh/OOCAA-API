const mongoose = require('mongoose');
const satelliteSchema = require('../models/satellite');

const cdmSchema = new mongoose.Schema({
    ccsdsCdmVers: { type: String },
    creationDate: { type: Date },
    originator: { type: String },
    messageId: { type: String },
    tca: { type: Date }, // Time of Closest Approach
    missDistance: { type: Number }, // Minimum distance at closest approach
    event: { type: String },
    satellite1: { type: satelliteSchema },
    satellite2: { type: satelliteSchema }
});

module.exports = mongoose.model('CDM', cdmSchema);
