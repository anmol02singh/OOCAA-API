import mongoose from 'mongoose';

const tleSchema = new mongoose.Schema({
  designator: { type: String },
  tleLine1: { type: String },
  tleLine2: { type: String },
  epoch: { type: Date},
});

export default mongoose.model('TLE', tleSchema);
