const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');

// Yeni restoran oluşturma (auth zorunlu değil)
router.post('/add', async (req, res) => {
  try {
    const { name } = req.body;
    const newRestaurant = new Restaurant({ name });
    if (req.session && req.session.userId) {
      newRestaurant.owner = req.session.userId;
    }
    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Bu isimde bir restoran zaten mevcut.' });
    }
    console.error("Restoran ekleme hatası:", error);
    res.status(500).json({ message: 'Restoran oluşturulurken bir sunucu hatası oluştu.' });
  }
});

// Restoranları listeleme (auth zorunlu değil; login ise sadece sahibine ait olanlar)
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.session && req.session.userId) {
      query.owner = req.session.userId;
    }
    const restaurants = await Restaurant.find(query);
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Restoranlar listelenirken hata oluştu.' });
  }
});

// Belirli bir kullanıcı adına (username) veya userId'ye ait restoranları listeleme
router.get('/user/:username', async (req, res) => {
  try {
    const User = require('../models/User');
    const rawParam = (req.params.username || '').toString().trim();

    // Eğer geçerli bir ObjectId ise doğrudan owner üzerinden ara
    if (mongoose.Types.ObjectId.isValid(rawParam)) {
      const restaurantsById = await Restaurant.find({ owner: rawParam });
      return res.status(200).json(restaurantsById);
    }

    // Değilse, username olarak kabul et
    const username = rawParam.toLowerCase();
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(200).json([]); // kullanıcı yoksa boş liste dön
    }
    const restaurants = await Restaurant.find({ owner: user._id });
    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Kullanıcı adına göre restoran listeleme hatası:", error);
    res.status(500).json({ message: 'Restoranlar listelenirken hata oluştu.' });
  }
});

module.exports = router;