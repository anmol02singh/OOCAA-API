<<<<<<< HEAD
const mongoose = require('mongoose');
=======
import mongoose from "mongoose";
>>>>>>> main

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  primaryObjectDesignator: { type: String, required: true },
  primaryObjectName: { type: String },
  primaryObjectType: { type: String },
  secondaryObjectDesignator: { type: String, required: true },
  secondaryObjectName: { type: String },
  secondaryObjectType: { type: String },
  tca: { type: Date, required: true },
<<<<<<< HEAD
=======
  missDistances: { type: [Number], default: [] },
  collisionProbabilities: { type: [Number], default: [] },
  primaryOperatorOrganization: { type: String },
  secondaryOperatorOrganization: { type: String },
>>>>>>> main
});

export default mongoose.model('Event', eventSchema);