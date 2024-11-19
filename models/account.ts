const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
});

module.exports = mongoose.model('Account', accountSchema);
