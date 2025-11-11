// backend/routes/restaurants.js - DAHA AKILLI HATA YÖNETİMİ
const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const isAuth = require('../middleware/isAuth');

// Yeni restoran oluşturma
router.post('/add', isAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const newRestaurant = new Restaurant({ name, owner: req.session.userId });
    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (error) {
    // DEĞİŞİKLİK BURADA: Hatanın türünü kontrol ediyoruz
    // Eğer hata, MongoDB'nin "duplicate key" (zaten var) hatasıysa (kod 11000),
    // o zaman spesifik bir mesaj gönderiyoruz.
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Bu isimde bir restoranınız zaten mevcut.' }); // 409 Conflict daha doğru bir koddur.
    }
    // Diğer tüm hatalar için genel bir sunucu hatası mesajı gönderiyoruz.
    console.error("Restoran ekleme hatası:", error); // Hatayı terminale yazdırarak ne olduğunu anlarız.
    res.status(500).json({ message: 'Restoran oluşturulurken bir sunucu hatası oluştu.' });
  }
});

// Giriş yapan kullanıcıya ait restoranları listeleme
router.get('/', isAuth, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.session.userId });
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Restoranlar listelenirken hata oluştu.' });
  }
});

module.exports = router;