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

// Belirli bir userId'ye ait restoranları listeleme
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = (req.params.userId || '').toString().trim();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Geçersiz userId.' });
    }
    const restaurants = await Restaurant.find({ owner: userId });
    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Kullanıcı adına göre restoran listeleme hatası:", error);
    res.status(500).json({ message: 'Restoranlar listelenirken hata oluştu.' });
  }
});

module.exports = router;