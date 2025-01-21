const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name: { type: String, required: false },
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    role: { type: String, required: true }
});

module.exports = mongoose.model('Account', accountSchema);
