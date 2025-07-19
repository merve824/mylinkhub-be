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
