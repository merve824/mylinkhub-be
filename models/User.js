const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    fullName: String,
    avatarUrl: String,
    headerUrl: String,
    bio: String,
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
