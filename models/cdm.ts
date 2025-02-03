import mongoose from 'mongoose';
import satelliteSchema from '../models/satellite';

const cdmSchema = new mongoose.Schema({
    ccsdsCdmVers: { type: String },
    creationDate: { type: Date },
    originator: { type: String },
    messageId: { type: String },
    tca: { type: Date }, 
    missDistance: { type: Number }, 
    event: { type: String },
    satellite1: { type: satelliteSchema },
    satellite2: { type: satelliteSchema }
});

export default mongoose.model('CDM', cdmSchema);
