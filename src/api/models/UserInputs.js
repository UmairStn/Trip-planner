const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserInputsSchema = new Schema({
    cities: String,
    duration: Number,
    budget: String,
    interests: [String], // Array of strings
    includeHiddenPlace: Boolean,
    allowAiSuggestions: Boolean,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserInputs', UserInputsSchema);