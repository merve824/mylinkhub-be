const mongoose = require('mongoose');

const customLink = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    imageUrl: String,
});

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    preUsername: { type: String, sparse: true },
    fullname: { type: String },
    avatarUrl: { type: String },
    headerUrl: { type: String },
    bio: { type: String },
    location: { type: String },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isFrozen: { type: Boolean, default: false },
    backgroundColor: { type: String },
    font: { type: String },
    createdAt: { type: Date, default: Date.now },
    socialLinks: {
        personal: String,
        instagram: String,
        tiktok: String,
        youtube: String,
        github: String,
        linkedin: String,
        spotify: String,
        x: String,
        snapchat: String,
        pinterest: String,
        twitch: String,
        kick: String,
        facebook: String,
        patreon: String,
        reddit: String,
    },
    customLinks: [customLink],
});

module.exports = mongoose.model('User', userSchema);
