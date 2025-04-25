import mongoose from 'mongoose';
import objectSchema from './object';

const cdmSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    constellation: String,
    cdmId: String,
    filename: String,
    insertEpoch: Date,
    ccsdsCdmVers: String,
    comment: String,
    creationDate: Date,
    originator: String,
    messageFor: String,
    messageId: {type: String, required: true, unique: true},
    commentEmergencyReportable: String,
    tca: Date,
    missDistance: Number,
    missDistanceUnit: String,
    relativeSpeed: Number,
    relativeSpeedUnit: String,
    relativePosition: {
        r: Number,
        t: Number,
        n: Number,
        rUnit: String,
        tUnit: String,
        nUnit: String
    },
    relativeVelocity: {
        r: Number,
        t: Number,
        n: Number,
        rUnit: String,
        tUnit: String,
        nUnit: String
    },
    startScreenPeriod: Date,
    stopScreenPeriod: Date,
    screenVolumeFrame: String,
    screenVolumeShape: String,
    screenVolume: {
        x: Number,
        y: Number,
        z: Number
    },
    screenEntryTime: Date,
    screenExitTime: Date,
    commentScreeningOption: String,
    collisionProbability: Number,
    collisionProbabilityMethod: String,
    commentEffectiveHBR: String,
    object1: { type: objectSchema },
    object2: { type: objectSchema },
    gid: String
});

export default mongoose.model('CDM', cdmSchema);
