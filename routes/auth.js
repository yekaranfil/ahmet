// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// KULLANICI KAYDI (REGISTER)
// POST: /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor.' });
    }
    // username opsiyonel; varsa set et
    user = new User({ email, password, ...(username ? { username } : {}) });
    await user.save();

    // Kullanıcıyı kaydettikten sonra otomatik olarak oturum açtır
    req.session.userId = user.id;
    res.status(201).json({ id: user.id, email: user.email, username: user.username });

  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten alınmış.' });
    }
    res.status(500).send('Sunucu Hatası');
  }
});

// KULLANICI GİRİŞİ (LOGIN)
// POST: /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı bilgileri.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı bilgileri.' });
    }

    req.session.userId = user.id;
    res.status(200).json({ id: user.id, email: user.email });

  } catch (error) {
    res.status(500).send('Sunucu Hatası');
  }
});

// KULLANICI ÇIKIŞI (LOGOUT)
// POST: /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Çıkış yapılamadı.');
    }
    res.clearCookie('connect.sid'); // Session cookie'sini temizle
    res.status(200).json({ message: 'Başarıyla çıkış yapıldı.' });
  });
});

// OTURUM KONTROLÜ
// GET: /api/auth/check-session
router.get('/check-session', (req, res) => {
    if (req.session.userId) {
        res.status(200).json({ loggedIn: true, userId: req.session.userId });
    } else {
        res.status(200).json({ loggedIn: false });
    }
});

module.exports = router;