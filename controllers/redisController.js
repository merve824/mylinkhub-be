const User = require('../models/User');
const redis = require('../config/redis');

const REDIS_TTL = 60; // 1dk
const redisKey = (username) => `redisKey:${username}`;

exports.testRedis = async (req, res) => {
    const username = req.params.username;

    try {
        const cached = await redis.get(redisKey(username));
        if (cached) {
            const profile = JSON.parse(cached);
            return res.json({ profile, message: 'redis data' });
        }

        const user = await User.findOne({ username }).select(
            'email customLinks socailLinks avatarUrl headerUrl'
        );

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcu bulunamadı.' });
        }

        await redis.setEx(redisKey(username), REDIS_TTL, JSON.stringify(user));

        res.json({ profile: user, message: 'mongodb data' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};
