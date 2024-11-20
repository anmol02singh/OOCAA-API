import mongoose from "mongoose";

const satelliteSchema = new mongoose.Schema({
    object: String,
    objectDesignator: String,
    catalogName: String,
    internationalDesignator: String,
    ephemerisName: String,
    covarianceMethod: String,
    maneuverable: String,
    referenceFrame: String,
    position: {
        x: Number,
        y: Number,
        z: Number
    },
    velocity: {
        x_dot: Number,
        y_dot: Number,
        z_dot: Number
    },
    positionCovariance: {
        cr_r: Number,
        ct_r: Number,
        ct_t: Number,
        cn_r: Number,
        cn_t: Number,
        cn_n: Number
    },
    velocityCovariance: {
        crdot_r: Number,
        crdot_t: Number,
        crdot_n: Number,
        crdot_rdot: Number,
        ctdot_r: Number,
        ctdot_t: Number,
        ctdot_n: Number,
        ctdot_rdot: Number,
        ctdot_tdot: Number,
        cndot_r: Number,
        cndot_t: Number,
        cndot_n: Number,
        cndot_rdot: Number,
        cndot_tdot: Number,
        cndot_ndot: Number
    }
});

export default satelliteSchema;
