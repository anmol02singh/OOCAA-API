import mongoose from 'mongoose';
import objectSchema from './object';

const cdmSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    ccsdsCdmVers: { type: String },
    creationDate: { type: Date },
    originator: { type: String },
    messageId: { type: String },
    tca: { type: Date }, 
    missDistance: { type: Number }, 
    collisionProbability: { type: Number },
    object1: { type: objectSchema },
    object2: { type: objectSchema }
});

export default mongoose.model('CDM', cdmSchema);
