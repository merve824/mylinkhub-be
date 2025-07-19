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
    const { fullname, bio, location, avatarUrl, headerUrl, username } =
        req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res
                    .status(400)
                    .json({ message: 'Bu kullanıcı adı zaten alınmış.' });
            }
            user.username = username;
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
                socialLinks: user.socialLinks,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.getSocialLinks = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.status(200).json({
            message: 'Sosyal medya bağlantıları alındı.',
            socialLinks: user.socialLinks,
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.updateSocialLinks = async (req, res) => {
    const data = req.body;
    try {
        const user = await User.findById(req.userId).select('socialLinks');

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        const updateSocialLinks = { ...user.socialLinks, ...data };
        user.socialLinks = updateSocialLinks;
        await user.save();

        res.status(200).json({
            message: 'Sosyal medya bağlantıları güncellendi.',
            socialLinks: updateSocialLinks,
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.getCustomLinks = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.status(200).json({
            message: 'Özel bağlantılar alındı.',
            customLinks: user.customLinks,
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.addCustomLink = async (req, res) => {
    const data = req.body;

    if (!data.title || !data.description || !data.url) {
        return res.status(404).json({ message: 'Eksik veri girdisi.' });
    }

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        const newCustomLinks = [...user.customLinks, data];

        user.customLinks = newCustomLinks;
        await user.save();

        res.status(200).json({
            message: 'Yeni özel bağlantı eklendi.',
            customLinks: newCustomLinks,
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.updateCustomLink = async (req, res) => {
    const data = req.body;

    if (!data.title || !data.description || !data.url) {
        return res.status(404).json({ message: 'Eksik veri girdisi.' });
    }

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        const existCustomLink = user.customLinks.find(
            (item) => item._id.toString() === data.id
        );

        existCustomLink.title = data.title;
        existCustomLink.description = data.description;
        existCustomLink.url = data.url;
        existCustomLink.imageUrl = data.imageUrl;

        await user.save();

        res.status(200).json({
            message: 'Yeni özel bağlantı eklendi.',
            customLinks: user.customLinks,
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.deleteCustomLink = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        const initialLength = user.customLinks.length;
        user.customLinks = user.customLinks.filter(
            (link) => link._id.toString() !== id
        );

        if (user.customLinks.length === initialLength) {
            return res.status(404).json({ message: 'Bağlantı bulunamadı' });
        }

        await user.save();

        res.status(200).json({
            message: 'Bağlantı başarıyla silindi.',
            customLinks: user.customLinks,
        });
    } catch (error) {
        console.error('Bağlantı silinirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};
