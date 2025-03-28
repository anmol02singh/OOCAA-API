import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  primaryObjectDesignator: { type: String, required: true },
  primaryObjectName: { type: String },
  primaryObjectType: { type: String },
  secondaryObjectDesignator: { type: String, required: true },
  secondaryObjectName: { type: String },
  secondaryObjectType: { type: String },
  tca: { type: Date, required: true },
  missDistances: { type: [Number], default: [] },
  collisionProbabilities: { type: [Number], default: [] },
  primaryOperatorOrganization: { type: String },
  secondaryOperatorOrganization: { type: String },
});

export default mongoose.model('Event', eventSchema);