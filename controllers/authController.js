const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
        return res.status(400).json({ message: 'Email veya telefon gerekli.' });
    }

    try {
        const orQuery = [];
        if (email) orQuery.push({ email });
        if (phone) orQuery.push({ phone });

        const existingUser = await User.findOne({ $or: orQuery });

        if (existingUser)
            return res
                .status(409)
                .json({ message: 'Kullanıcı zaten kayıtlı.' });

        const passwordHash = await bcrypt.hash(password, 10);

        if (email) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiresAt = new Date(Date.now() + 3 * 60 * 1000);

            const newUser = new User({
                email,
                phone,
                password: passwordHash,
                otp: phone ? null : otp,
                otpExpiresAt: phone ? null : otpExpiresAt,
            });
            await newUser.save();

            email && (await sendOTPEmail(email, otp));

            res.status(201).json({
                message:
                    'Mail adresine OTP gönderildi. (Spam kutunuzu kontrol ediniz)',
            });
        } else {
            const newUser = new User({
                email,
                phone,
                password: passwordHash,
                isVerified: true,
            });
            await newUser.save();

            res.status(201).json({
                message: 'Kullanıcı başarıyla kaydedildi.',
            });
        }
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası', error: err.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }

        if (user.isVerified) {
            return res
                .status(400)
                .json({ success: false, message: 'Doğrulanmış kullanıcı.' });
        }

        if (user.otp !== otp || user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP geçersiz veya süresi dolmuş.',
            });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Kayıt tamamlandı.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Doğrulama hatası.',
        });
    }
};

exports.resendRegisterOtp = async (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.status(400).json({ message: 'Email gerekli.' });
    }

    try {
        const existUser = await User.findOne({ email });

        if (!existUser) {
            return res
                .status(404)
                .json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }

        if (existUser.otp && existUser.otpExpiresAt > new Date()) {
            return res
                .status(404)
                .json({ success: false, message: 'Mevcut OTP hala geçerli.' });
        }

        if (existUser.isVerified) {
            return res
                .status(404)
                .json({ success: false, message: 'Doğrulanmış kullanıcı.' });
        }

        if (!existUser.otp || !existUser.otpExpiresAt) {
            return res.status(404).json({
                success: false,
                message:
                    'OTP işlemi bulunamadı. Lütfen OTP gerektiren bir işlem başlatın.',
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 3 * 60 * 1000);

        existUser.otp = otp;
        existUser.otpExpiresAt = otpExpiresAt;
        await existUser.save();

        res.status(201).json({
            message:
                'Mail adresine OTP gönderildi. (Spam kutunuzu kontrol ediniz)',
        });
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
        return res.status(400).json({ message: 'Email veya telefon gerekli.' });
    }

    try {
        const user = await User.findOne({
            $or: [email ? { email } : null, phone ? { phone } : null].filter(
                Boolean
            ),
        });

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Şifre hatalı.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası', error: err.message });
    }
};
