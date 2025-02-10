const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  primaryObjectDesignator: { type: String, required: true },
  secondaryObjectDesignator: { type: String, required: true },
  tca: { type: Date, required: true },
});

export default mongoose.model('Event', eventSchema);