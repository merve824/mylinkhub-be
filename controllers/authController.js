const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { email, phoneNumber, password } = req.body;

    if (!email && !phone) {
        return res.status(400).json({ message: 'Email veya telefon gerekli.' });
    }

    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }],
        });
        if (existingUser)
            return res.status(409).json({ message: 'Kullanıcı zaten var.' });

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ email, phone, password: passwordHash });
        await newUser.save();

        const token = generateToken(newUser);
        res.status(201).json({
            token,
            message: 'Kullanıcı başarıyla kaydedildi.',
        });
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası', error: err });
    }
};

exports.login = async (req, res) => {};
