const User = require('../models/User');

exports.getUsername = async (req, res) => {
    try {
        const existingUser = await User.findById(req.userId).select(
            'fullname username'
        );
        if (!existingUser)
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

        res.status(200).json({
            username: existingUser?.username
                ? existingUser.username
                : existingUser.fullName,
        });
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası', error: err.message });
    }
};

exports.preChooseUsername = async (req, res) => {
    const { username, email, phone } = req.body;

    try {
        const existingUser = await User.findOne({
            $or: [email ? { email } : null, phone ? { phone } : null].filter(
                Boolean
            ),
        });

        if (!existingUser)
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

        if (existingUser.username) {
            return res.status(400).json({
                message: 'Kullanıcı adı zaten seçilmiş.',
            });
        }

        const usernameTaken = await User.findOne({ username });
        if (usernameTaken) {
            return res.status(409).json({
                message: 'Bu kullanıcı adı zaten alınmış.',
            });
        }

        existingUser.username = username;
        await existingUser.save();

        res.status(200).json({ message: 'Kullanıcı adı başarıyla seçildi.' });
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası', error: err.message });
    }
};

exports.chooseUsername = async (req, res) => {
    const { username } = req.body;

    try {
        const existingUser = await User.findById(req.userId);
        if (!existingUser)
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

        if (existingUser.username) {
            return res.status(400).json({
                message: 'Kullanıcı adı zaten seçilmiş.',
            });
        }

        existingUser.username = username;
        await existingUser.save();

        res.status(200).json({ message: 'Kullanıcı adı başarıyla seçildi.' });
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası', error: err.message });
    }
};

exports.getUserProfileByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).select(
            'username fullName avatarUrl headerUrl bio -_id'
        );

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.getAccountDetails = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select(
            '-_id -createdAt -password'
        );

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.updateProfile = async (req, res) => {
    const userId = req.userId;
    const { fullname, bio, location, avatarUrl, headerUrl } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        user.fullname = fullname || user.fullname;
        user.bio = bio || user.bio;
        user.location = location || user.location;
        user.avatarUrl = avatarUrl || user.avatarUrl;
        user.headerUrl = headerUrl || user.headerUrl;

        await user.save();

        res.status(200).json({
            message: 'Profil başarıyla güncellendi.',
            user: {
                fullname: user.fullname,
                bio: user.bio,
                location: user.location,
                avatarUrl: user.avatarUrl,
                headerUrl: user.headerUrl,
                username: user.username,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};
